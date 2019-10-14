const validateToken = require('./validate-token')

const upnToSam = upn => upn.split('@')[0]

module.exports = whitelist => {
  return async (request, response, next) => {
    const bearerToken = request.headers.authorization
    const { pathname } = request._parsedUrl
    const whitelisted = Array.isArray(whitelist) && whitelist.indexOf(pathname) >= 0
    if (!bearerToken && !whitelisted) {
      response.writeHead(401)
      response.end('missing Authorization header')
      return
    }
    try {
      const token = bearerToken.replace('Bearer ', '')
      const validatedToken = await validateToken(token)
      request.token = validatedToken
      request.username = upnToSam(validatedToken.upn)
    } catch (error) {
      if (!whitelisted) {
        response.writeHead(401)
        response.end('invalid token in Authorization header')
        return
      }
    }
    next()
  }
}

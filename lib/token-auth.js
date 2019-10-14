const validateToken = require('./validate-token')
const { logger } = require('@vtfk/logger')

const upnToSam = upn => upn.split('@')[0]

module.exports = whitelist => {
  return async (request, response, next) => {
    const bearerToken = request.headers.authorization
    const { pathname } = request._parsedUrl
    const whitelisted = Array.isArray(whitelist) && whitelist.indexOf(pathname) >= 0

    if (whitelisted) {
      return next()
    }

    if (!bearerToken) {
      logger('error', ['token-auth', 'missing Authorization header'])
      response.writeHead(401)
      response.end('missing Authorization header')
      return
    }

    try {
      const token = bearerToken.replace('Bearer ', '')
      const validatedToken = await validateToken(token)
      console.log(validatedToken)
      request.token = validatedToken
      request.username = upnToSam(validatedToken.upn)
      logger('info', ['token-auth', 'unique name', validatedToken.unique_name, 'upn', validatedToken.upn])
      logger('info', ['token-auth', 'validated token'])
    } catch (error) {
      logger('error', ['token-auth', 'invalid token', error.message])
      response.writeHead(401)
      response.end('invalid token in Authorization header')
      return
    }
    next()
  }
}

const validateToken = require('./validate-token')
const { logger } = require('@vtfk/logger')

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
      request.token = validatedToken
      request.username = validatedToken.upn
      logger('info', ['token-auth', 'username', request.username])
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

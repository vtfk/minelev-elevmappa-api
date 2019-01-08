const axios = require('axios')
const jwt = require('jsonwebtoken')
const md = require('markdown-it')()
const { send } = require('micro')
const { parse: urlParse } = require('url')
const { readFileSync } = require('fs')
const lookupBuddy = require('./lib/lookup-buddy')
const pkg = require('./package.json')
let config = require('./config')

function log (level, message) {
  if (config.debug) {
    const formatedMessage = typeof message === 'object' ? JSON.stringify(message) : message
    console.log(`[${level.toUpperCase()}] ${new Date().toUTCString()} ${pkg.name} - ${pkg.version}: ${formatedMessage}`)
  }
}

async function setup (handler) {
  try {
    log('info', `Requesting metadata from ${config.autodiscover_url}`)
    const { data: metadata } = await axios.get(config.autodiscover_url)
    log('info', `Got data from ${config.autodiscover_url}`)
    config.metadata = metadata
    log('info', `Requesting metadata from ${metadata.jwks_uri}`)
    const { data: keyData } = await axios.get(metadata.jwks_uri)
    log('info', `Got data from ${metadata.jwks_uri}`)
    config.keys = keyData.keys
    return handler
  } catch (error) {
    throw error
  }
}

function validateToken (token) {
  const decodedToken = jwt.decode(token, { complete: true })
  const { x5c } = config.keys.find(key => decodedToken.header.x5t === key.x5t)
  const pubCert = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`
  let verifiedToken
  try {
    verifiedToken = jwt.verify(token, pubCert)
  } catch (error) {
    throw error
  }
  return verifiedToken
}

async function getMyStudents (user) {
  const query = {
    userId: user,
    url: `${process.env.BUDDY_SERVICE_URL}/students?name=*`
  }
  return lookupBuddy(query)
}

module.exports = setup((request, response) => {
  const { pathname } = urlParse(request.url, true)
  if (pathname === '/api/students') {
    const bearerToken = request.headers.authorization
    if (bearerToken) {
      const token = bearerToken.replace('Bearer ', '')
      const validatedToken = validateToken(token)
      if (validatedToken) {
        return getMyStudents(validatedToken.upn.replace('@t-fk.no', ''))
      } else {
        send(response, 401, { message: 'invalid token' })
      }
    } else {
      send(response, 401, { message: 'missing required token' })
    }
  } else if (pathname === '/favicon.ico') {
    return ''
  } else {
    const readme = readFileSync(`${__dirname}/README.md`, 'utf-8')
    send(response, 200, md.render(readme))
  }
})

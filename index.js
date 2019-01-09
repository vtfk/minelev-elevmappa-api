const axios = require('axios')
const jwt = require('jsonwebtoken')
const md = require('markdown-it')()
const { send } = require('micro')
const { parse: urlParse } = require('url')
const { readFileSync } = require('fs')
const lookupBuddy = require('./lib/lookup-buddy')
const pkg = require('./package.json')

function log (level, message) {
  const formatedMessage = typeof message === 'object' ? JSON.stringify(message) : message
  console.log(`[${level.toUpperCase()}] ${new Date().toUTCString()} ${pkg.name} - ${pkg.version}: ${formatedMessage}`)
}

async function getKeys () {
  const autodiscoverUrl = 'https://login.microsoftonline.com/' + process.env.MOA_TENANT_ID + '/.well-known/openid-configuration'
  try {
    log('info', `Requesting metadata from ${autodiscoverUrl}`)
    const { data: metadata } = await axios.get(autodiscoverUrl)
    log('info', `Got data from ${autodiscoverUrl}`)
    log('info', `Requesting metadata from ${metadata.jwks_uri}`)
    const { data: keyData } = await axios.get(metadata.jwks_uri)
    log('info', `Got data from ${metadata.jwks_uri}`)
    return keyData.keys
  } catch (error) {
    log('error', error)
    throw error
  }
}

async function validateToken (token) {
  const decodedToken = jwt.decode(token, { complete: true })
  const keys = await getKeys()
  const { x5c } = keys.find(key => decodedToken.header.x5t === key.x5t)
  const pubCert = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`
  let verifiedToken
  try {
    verifiedToken = jwt.verify(token, pubCert)
  } catch (error) {
    throw error
  }
  return verifiedToken
}

function fixUpn (upn) {
  const list = upn.split('@')
  return list[0]
}

module.exports = async (request, response) => {
  const { pathname } = urlParse(request.url, true)
  if (pathname === '/api/students') {
    const bearerToken = request.headers.authorization
    if (bearerToken) {
      const token = bearerToken.replace('Bearer ', '')
      const validatedToken = await validateToken(token)
      if (validatedToken) {
        log('info', `lookup buddy for ${validatedToken.upn}`)
        return lookupBuddy(fixUpn(validatedToken.upn))
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
}

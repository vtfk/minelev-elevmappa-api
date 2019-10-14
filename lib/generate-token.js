const jwt = require('jsonwebtoken')
const pkg = require('../package.json')

module.exports = settings => {
  const payload = {
    system: pkg.name,
    version: pkg.version
  }

  if (settings.userId) {
    payload.caller = settings.userId
  }

  const options = {
    expiresIn: '1m',
    issuer: 'https://auth.t-fk.no'
  }

  return `Bearer ${jwt.sign(payload, settings.secret, options)}`
}

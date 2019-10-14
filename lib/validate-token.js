const jwt = require('jsonwebtoken')
const getKeys = require('./get-keys')
const config = require('../config')

module.exports = async token => {
  const decodedToken = jwt.decode(token, { complete: true })
  if (decodedToken.payload.aud !== config.auth.appId) {
    throw Error('Wrong App ID in azure config')
  }
  if (!decodedToken.payload.iss.includes(config.auth.tenantId)) {
    throw Error('Wrong tenant ID in azure config')
  }
  const keys = await getKeys()
  const { x5c } = keys.find(key => decodedToken.header.x5t === key.x5t)
  const pubCert = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`

  return jwt.verify(token, pubCert)
}

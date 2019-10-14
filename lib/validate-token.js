const jwt = require('jsonwebtoken')
const getKeys = require('./get-keys')

module.exports = async token => {
  const decodedToken = jwt.decode(token, { complete: true })
  const keys = await getKeys()
  const { x5c } = keys.find(key => decodedToken.header.x5t === key.x5t)
  const pubCert = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`
  return jwt.verify(token, pubCert)
}

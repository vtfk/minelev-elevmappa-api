const { logger } = require('@vtfk/logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async fnr => {
  logger('info', ['retrieve-documents', 'start'])
  const client = p360(config)
  console.log(fnr)
  return client.getDocuments(fnr)
}

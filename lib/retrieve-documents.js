const logger = require('./logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async fnr => {
  logger('info', ['retrieve-documents', 'start'])
  const client = p360(config)
  const documents = await client.getDocuments(fnr)
  // const documents = require(`${__dirname}/data/documents.json`)
  return documents
}

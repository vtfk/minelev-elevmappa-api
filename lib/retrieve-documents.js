const logger = require('./logger')

module.exports = async fnr => {
  logger('info', ['retrieve-documents', 'start'])
  const documents = require(`${__dirname}/data/documents.json`)
  return documents
}

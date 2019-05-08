const logger = require('./logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async fnr => {
  logger('info', ['retrieve-documents', 'start'])
  const client = p360(config)
  console.log(fnr)
  try {
    const documents = await client.getDocuments(fnr)
    // console.log(documents)
    // const documents = require(`${__dirname}/data/documents.json`)
    return documents
  } catch (error) {
    throw error
  }
}

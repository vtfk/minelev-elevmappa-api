const p360 = require('./p360')
const config = require('../config')

module.exports = async (documentId, recno) => {
  const client = p360(config)
  return client.getFiles(documentId, recno)
}

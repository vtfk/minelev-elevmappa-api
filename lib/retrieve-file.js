const p360 = require('./p360')
const config = require('../config')

module.exports = async (documentId, recno) => {
  const client = p360(config)
  try {
    const file = await client.getFiles(documentId, recno)
    return file
  } catch (error) {
    throw error
  }
}

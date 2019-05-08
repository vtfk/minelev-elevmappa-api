const p360 = require('./p360')
const config = require('../config')

module.exports = async (documentId) => {
  const client = p360(config)
  try {
    const file = await client.getFiles(documentId)
    return file
  } catch (error) {
    throw error
  }
}

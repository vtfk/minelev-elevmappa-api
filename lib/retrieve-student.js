const axios = require('axios')
const generateToken = require('./generate-token')
const retrieveDocuments = require('./retrieve-documents')
const { logger } = require('@vtfk/logger')
const config = require('../config')

module.exports = async (userId, studentUsername) => {
  const settings = {
    secret: config.buddy.jwtSecret,
    userId: userId
  }
  logger('info', ['retrieve-student', userId, studentUsername, 'start'])
  const url = `${config.buddy.url}/students/${studentUsername}`
  const token = generateToken(settings)
  axios.defaults.headers.common.Authorization = token
  logger('info', ['retrieve-student', userId, studentUsername, url, 'lookup students'])
  const { data: students } = await axios(url)
  if (students.length > 0) {
    logger('info', ['retrieve-student', userId, studentUsername, 'got students', students.length])
    const student = students[0]
    logger('info', ['retrieve-student', userId, studentUsername, 'lookup documents'])
    const { documents, caseNumber } = await retrieveDocuments(student.personalIdNumber)
    student.caseNumber = caseNumber
    logger('info', ['retrieve-student', userId, studentUsername, 'got documents', documents.length])
    student.documents = documents
    return student
  } else {
    logger('warn', ['retrieve-student', userId, studentUsername, 'no students found'])
    return false
  }
}

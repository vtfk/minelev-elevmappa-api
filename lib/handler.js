const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const retrieveStudents = require('./retrieve-students')
const retrieveStudent = require('./retrieve-student')
const retrieveFile = require('./retrieve-file')
const logger = require('./logger')
const { unescape } = require('querystring')

function fixUpn (upn) {
  const list = upn.split('@')
  return list[0]
}

module.exports.getStudents = async (request, response) => {
  const validatedToken = request.token
  const username = fixUpn(validatedToken.upn)
  logger('info', ['handler', 'getStudents', username])
  try {
    const students = await retrieveStudents(username)
    send(response, 200, students || [])
  } catch (error) {
    throw error
  }
}

module.exports.getStudent = async (request, response) => {
  const validatedToken = request.token
  const username = fixUpn(validatedToken.upn)
  const { id } = request.params
  logger('info', `lookup buddy for ${username}`)
  try {
    const student = await retrieveStudent(username, id)
    send(response, student ? 200 : 404, student || { message: 'not found' })
  } catch (error) {
    throw error
  }
}

module.exports.getFile = async (request, response) => {
  const { id } = request.params
  const documentId = unescape(id)
  try {
    const file = await retrieveFile(documentId)
    send(response, file ? 200 : 404, file || { message: 'not found' })
  } catch (error) {
    throw error
  }
}

module.exports.getFrontpage = async (request, response) => {
  const readme = readFileSync(`${__dirname}/../README.md`, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => {
  return ''
}

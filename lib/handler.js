const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const retrieveStudents = require('./retrieve-students')
const retrieveStudent = require('./retrieve-student')
const logger = require('./logger')

function fixUpn (upn) {
  const list = upn.split('@')
  return list[0]
}

module.exports.getStudents = async (request, response) => {
  const validatedToken = request.token
  logger('info', ['handler', 'getStudents', validatedToken.upn])
  try {
    const students = await retrieveStudents(fixUpn(validatedToken.upn))
    send(response, 200, students || [])
  } catch (error) {
    throw error
  }
}

module.exports.getStudent = async (request, response) => {
  const validatedToken = request.token
  const { id } = request.params
  logger('info', `lookup buddy for ${validatedToken.upn}`)
  try {
    const student = await retrieveStudent(fixUpn(validatedToken.upn), id)
    send(response, student ? 200 : 404, student || { message: 'not found' })
  } catch (error) {
    throw error
  }
}

/*
module.exports.getFile = async (request, response) => {
  const validatedToken = request.token
  const { id } = request.params
}
*/

module.exports.getFrontpage = async (request, response) => {
  const readme = readFileSync(`${__dirname}/../README.md`, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => {
  return ''
}

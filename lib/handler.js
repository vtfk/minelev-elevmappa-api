const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const validateToken = require('./validate-token')
const retrieveStudents = require('./retrieve-students')
const retrieveStudent = require('./retrieve-student')
const logger = require('./logger')

function fixUpn (upn) {
  const list = upn.split('@')
  return list[0]
}

module.exports.getStudents = async (request, response) => {
  const bearerToken = request.headers.authorization
  if (bearerToken) {
    const token = bearerToken.replace('Bearer ', '')
    const validatedToken = await validateToken(token)
    if (validatedToken) {
      logger('info', ['handler', 'getStudents', validatedToken.upn])
      const students = await retrieveStudents(fixUpn(validatedToken.upn))
      send(response, 200, students || [])
    } else {
      send(response, 401, { message: 'invalid token' })
    }
  } else {
    send(response, 401, { message: 'missing required token' })
  }
}

module.exports.getStudent = async (request, response) => {
  const { id } = request.params
  const bearerToken = request.headers.authorization
  if (bearerToken) {
    const token = bearerToken.replace('Bearer ', '')
    const validatedToken = await validateToken(token)
    if (validatedToken) {
      logger('info', `lookup buddy for ${validatedToken.upn}`)
      const student = await retrieveStudent(fixUpn(validatedToken.upn), id)
      send(response, student ? 200 : 404, student || { message: 'not found' })
    } else {
      send(response, 401, { message: 'invalid token' })
    }
  } else {
    send(response, 401, { message: 'missing required token' })
  }
}

module.exports.getFrontpage = async (request, response) => {
  const readme = readFileSync(`${__dirname}/../README.md`, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => {
  return ''
}

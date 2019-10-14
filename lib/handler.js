const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 900 })
const retrieveStudents = require('./retrieve-students')
const retrieveStudent = require('./retrieve-student')
const retrieveFile = require('./retrieve-file')
const { unescape } = require('querystring')
const { logger } = require('@vtfk/logger')

async function verifyStudentTeacherRelation (teacher, student) {
  // Return teacher student relation from cache
  const cachedInfo = cache.get(teacher)
  if (cachedInfo) {
    logger('info', ['handler', 'validateStudentTeacherRelation-from-cache', teacher, student])
    return cachedInfo.find(({ userName }) => userName === student)
  }

  // Return if not in cache
  const students = await retrieveStudents(teacher)
  cache.set(teacher, students)
  logger('info', ['handler', 'validateStudentTeacherRelation', teacher, student])
  return students.find(({ userName }) => userName === student)
}

module.exports.getStudents = async (request, response) => {
  const { username } = request
  if (!username) {
    send(response, 500, 'Username not found')
    return
  }

  logger('info', ['handler', 'getStudents', username])

  // Return students from cache
  const cachedInfo = cache.get(username)
  if (cachedInfo) {
    logger('info', ['handler', 'getStudents-from-cache', username])
    send(response, 200, cachedInfo)
    return
  }

  // Return students if not in cache
  try {
    const students = await retrieveStudents(username)
    cache.set(username, students)
    send(response, 200, students || [])
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getStudent = async (request, response) => {
  const { username } = request
  const { id } = request.params

  if (!username) {
    send(response, 500, 'Username not found')
    return
  }

  logger('info', `lookup buddy for teacher: ${username} student: ${id}`)

  // Return student from cache
  const cachedInfo = cache.get(username + id)
  if (cachedInfo) {
    send(response, 200, cachedInfo)
    return
  }

  // Return student if not in cache
  try {
    const checkRelation = await verifyStudentTeacherRelation(username, id)
    if (!checkRelation) {
      throw Error('Ingen tilgang. Lærer/Elev relasjon finnes ikke i Extens.')
    }
    const student = await retrieveStudent(username, id)
    cache.set(username + id, student)
    send(response, student ? 200 : 404, student || { message: 'not found' })
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getFile = async (request, response) => {
  const { id, recno } = request.params
  const documentId = unescape(id)
  try {
    // Needs to verify teacher-student relation
    const file = await retrieveFile(documentId, recno)
    send(response, file ? 200 : 404, file || { message: 'not found' })
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getFrontpage = async (request, response) => {
  const readme = readFileSync(`${__dirname}/../README.md`, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => ''

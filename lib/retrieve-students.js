const axios = require('axios')
const generateToken = require('./generate-token')
const { logger } = require('@vtfk/logger')
const config = require('../config')

module.exports = async userId => {
  const settings = {
    secret: config.buddy.jwtSecret,
    userId: userId
  }
  const url = `${config.buddy.url}/students?name=*`
  const token = generateToken(settings)
  axios.defaults.headers.common.Authorization = token
  logger('info', ['retrieve-students', userId, url])
  try {
    const { data } = await axios(url)
    logger('info', ['retrieve-students', userId, 'got data', data.length])
    return !data.statusKode ? data : false
  } catch (error) {
    logger('error', ['retrieve-students', userId, error])
    return false
  }
}

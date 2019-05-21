const axios = require('axios')
const generateToken = require('./generate-token')
const { logger } = require('@vtfk/logger')

module.exports = async userId => {
  const settings = {
    secret: process.env.BUDDY_JWT_SECRET,
    userId: userId
  }
  const url = `${process.env.BUDDY_SERVICE_URL}/students?name=*`
  const token = generateToken(settings)
  axios.defaults.headers.common['Authorization'] = token
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

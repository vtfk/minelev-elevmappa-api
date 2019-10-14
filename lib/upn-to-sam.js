const axios = require('axios')
const config = require('../config')
const generateToken = require('./generate-token')

module.exports = async upn => {
  const url = `https://identities.api.minelev.no/identities/upn/${upn}`
  const token = generateToken({ secret: config.buddy.jwtSecret })
  axios.defaults.headers.common.Authorization = token
  const { data } = await axios(url)
  return data.sam
}

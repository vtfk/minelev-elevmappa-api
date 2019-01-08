const axios = require('axios')
const generateToken = require('./generate-token')

module.exports = async query => {
  let settings = { secret: process.env.BUDDY_JWT_SECRET }
  if (query.userId) {
    settings.userId = query.userId
  }
  const token = generateToken(settings)
  axios.defaults.headers.common['Authorization'] = token
  const { data } = await axios(query.url, query.data)
  return data
}

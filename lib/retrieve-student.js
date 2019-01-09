const axios = require('axios')
const generateToken = require('./generate-token')

module.exports = async (userId, studentUsername) => {
  const settings = {
    secret: process.env.BUDDY_JWT_SECRET,
    userId: userId
  }
  const url = `${process.env.BUDDY_SERVICE_URL}/students/${studentUsername}`
  const token = generateToken(settings)
  axios.defaults.headers.common['Authorization'] = token
  const { data: students } = await axios(url)
  if (students.length > 0) {
    const student = students[0]
    student.documents = require(`${__dirname}/data/documents.json`)
    return student
  } else {
    return false
  }
}

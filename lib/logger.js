const pkg = require('../package.json')

module.exports = (level, message) => {
  const data = Array.isArray(message) ? message : [message]
  return console.log(`${new Date().toUTCString()} - ${level.toUpperCase()} - ${pkg.name} - ${pkg.version}: ${data.join(' - ')}`)
}

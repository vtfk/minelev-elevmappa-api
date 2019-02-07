module.exports = {
  username: process.env.P360_WS_USERNAME || 'domain/username',
  password: process.env.P360_WS_PASSWORD || 'password',
  baseUrl: process.env.P360_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
}

const axios = require('axios')
const { setupCache } = require('axios-cache-adapter')
const { logger } = require('@vtfk/logger')
const config = require('../config')

const autodiscoverUrl = 'https://login.microsoftonline.com/' + config.auth.tenantId + '/.well-known/openid-configuration'

const cache = setupCache({
  maxAge: 600000
})

const api = axios.create({
  adapter: cache.adapter
})

module.exports = async () => {
  try {
    logger('info', ['get-keys', 'start', autodiscoverUrl])
    const { data: metadata } = await api.get(autodiscoverUrl)
    logger('info', ['get-keys', 'got metadata', autodiscoverUrl])
    logger('info', ['get-keys', 'request keys', metadata.jwks_uri])
    const { data: keyData } = await api.get(metadata.jwks_uri)
    logger('info', ['get-keys', 'got keys', metadata.jwks_uri])
    return keyData.keys
  } catch (error) {
    logger('error', error)
    throw error
  }
}

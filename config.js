module.exports = {
  username: process.env.P360_WS_USERNAME || 'domain/username',
  password: process.env.P360_WS_PASSWORD || 'password',
  baseUrl: process.env.P360_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/',
  auth: {
    /*
     * Find your Tenant ID for Azure in https://login.windows.net/<your-tenant-name>/.well-known/openid-configuration
     * Example: 08f3813c-0f00-000f-9aec-16ef7cbf477a
    */
    tenantId: process.env.MOA_TENANT_ID || 'tenant-id',
    /*
     * Your App ID for the registered app at https://portal.azure.com -> Azure
     * Active Directory -> App registrations
    */
    appId: process.env.MOA_APP_ID || 'your-app-id'
  }
}

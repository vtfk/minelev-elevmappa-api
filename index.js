const Router = require('router')
const finalhandler = require('finalhandler')
const cors = require('cors')

// Utilities
const handler = require('./lib/handler')

// Initialize a new router
const router = Router()

// CORS
router.use(cors())

// ROUTES
router.get('/', handler.getFrontpage)
router.get('/favicon.ico', handler.getFavicon)
router.get('/api/students/:id', handler.getStudent)
router.get('/api/students', handler.getStudents)

module.exports = (request, response) => {
  router(request, response, finalhandler(request, response))
}

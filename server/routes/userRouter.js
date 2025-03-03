const Router = require('express')
const router = new Router()
const userController = require('../controllers/userConttroller')
const authMiddelware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration )
router.post('/login', userController.login )
router.get('/auth', authMiddelware, userController.check)

module.exports = router
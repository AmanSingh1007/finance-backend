const { Router } = require('express');
const { login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../validations/auth.validation');

const router = Router();

router.post('/login', validate(loginSchema), login);

module.exports = router;

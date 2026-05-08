const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], signup);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.get('/me', authenticate, me);

module.exports = router;

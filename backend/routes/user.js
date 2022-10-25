const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const rateLimit = require('express-rate-limit')


const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
	message:
		'Too many accounts created from this IP, please try again after an hour',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const accountAccessLimiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 10,
	message:
		'Too many tries created from this IP, please try again after 30 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/signup', createAccountLimiter, userCtrl.signup);
router.post('/login', accountAccessLimiter, userCtrl.login);














module.exports = router;




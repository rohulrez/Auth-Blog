const express = require('express');
const authControllers = require('../controllers/auth-controllers');

const router = express.Router();

router.get('/signup', authControllers.getSignUp);

router.get('/login',  authControllers.getLogin)

router.post('/signup', authControllers.signup)

router.post('/login', authControllers.login)

router.post('/logout', authControllers.logout );

module.exports = router;
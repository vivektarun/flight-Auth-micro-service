const express = require('express');

const { UserController } = require('../../controllers');
const { AuthRequestMiddlewares } = require('../../middlewares');

const router = express.Router();

router.post('/signup', AuthRequestMiddlewares.validateCreateRequest, UserController.signup);
router.post('/signin', AuthRequestMiddlewares.validateCreateRequest, UserController.signin);
router.post('/role', UserController.addroleToUser)

module.exports = router;
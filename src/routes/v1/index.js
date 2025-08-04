const express = require('express');

const { InfoController } = require('../../controllers'); // By default from controller index.js is imported.
const userRoutes = require('./user-routes');

const router = express.Router();

router.get('/info', InfoController.info);

router.use('/signup', userRoutes)

module.exports = router;
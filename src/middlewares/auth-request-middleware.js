const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { UserService } = require('../services');

function validateCreateRequest(req, res, next) {
   const { email, password } = req.body;

    if(!email) {
        ErrorResponse.message = 'Something went wrong while authenticating user';
        ErrorResponse.error = new AppError(
            ['Email not found in the incoming request in the correct form'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if(!password) {
        ErrorResponse.message = 'Something went wrong while authenticating user';
        ErrorResponse.error = new AppError(
            ['Password not found in the incoming request in the correct form'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

async function checkAuth(req, res, next) {
    try {
        //Return id
        const response = await UserService.isAunthticated(req.headers['x-access-token']);
    
        if(response) {
            req.user = response; // Set the user id int he req object
            next();
        }
    } catch (error) {
        return res.status(error.statusCode).json(error);
    }
    
}

module.exports = {
    validateCreateRequest,
    checkAuth,

};

const { StatusCodes } = require('http-status-codes');
const user = require('../models/user');
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');

const userRepo = new UserRepository();

async function createUser(data) {
    try {
        const user = await userRepo.create(data);
        return user;
    } catch(error) {
        if(error.name == 'SequelizeValidationError' || error.name == 'SequelizeUniqueConstraintError') {
            let explanation = [];
            error.errors.forEach((error) => {
                explanation.push(error.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createUser,
}
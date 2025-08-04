const { StatusCodes } = require('http-status-codes');
const user = require('../models/user');
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { Auth } = require('../utils/common')

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

async function signin(data) {
    try {
        const user = await userRepo.getUserByEmail(data.email);

        if(!user) {
            throw new AppError('No user found for the provided email', StatusCodes.NOT_FOUND);
        }

        //Match the password
        const passwordMatch = Auth.checkPassword(data.password, user.password);

        if(!passwordMatch) {
            throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);
        }

        //Here id & and password are our integrity clames
        //While dcrypt mode we get back id & password
        const jwt = Auth.creteToken({id: user.id, email: user.email});
        
        return jwt;
    } catch(error) {
        if(error instanceof AppError) throw error;
        console.log(error);
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function isAunthticated(token) {
    try {
        if(!token) {
            throw new AppError('Missing jwt token', StatusCodes.BAD_REQUEST);
        }

        const response = Auth.verifyToken(token);
        
        //user -> {id, pass ...} from here we can fetch the data.
        const user = await userRepo.get(response.id);

        if(!user) {
            throw new AppError('No user found', StatusCodes.NOT_FOUND);
        }
        
        return user.id;
    } catch(error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT Token', StatusCodes.BAD_REQUEST);
        }
        console.log(error);
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createUser,
    signin,
    isAunthticated,

}
const UnauthentiatedError = require('../errors/badRequestError');
const UnauthorizedError = require('../errors/unthorizedError');
const {isToken} = require('../utils');

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;
    console.log(token);

    if (!token) {
        throw new UnauthentiatedError('Authentication Failed');
    }
    try {
        const {name, userId, role, score, rank} = isToken({token});
        req.user = {name, userId, role, score, rank};
        next();
    } catch (error) {
        throw new UnauthentiatedError('Authentication Failed');
    }
};

const attachUser = async (req, res, next) => {
    const token = req.signedCookies.token;
    if (!token) {
        next();
    } else {
        try {
            const {name, userId, role, score, rank} = isToken({token});
            req.user = {name, userId, role, score, rank};
            next();
        } catch (error) {
            throw new UnauthentiatedError('Authentication Failed');
        }
    }
};

const authorizePermission = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized Access');
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizePermission,
    attachUser,
};

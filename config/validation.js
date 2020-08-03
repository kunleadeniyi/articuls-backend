const Joi = require('@hapi/joi');
const { ValidationError } = require('@hapi/joi');

// Register validation
const registerValidation = (req,res,next) => {
    const schema = Joi.object().keys({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    const isValid = schema.validate(req.body);
    if (isValid.error) {
        next(isValid.error)
        res.status(400).send(isValid.error.details[0].message)
    } else {
        next()
    }
}

// Register validation
const loginValidation = (req,res,next) => {
    const schema = Joi.object().keys({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    const isValid = schema.validate(req.body);
    if (isValid.error) {
        next(isValid.error)
    } else {
        next()
    }
}

module.exports = {
    registerValidation, loginValidation
};

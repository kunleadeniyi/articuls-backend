const authRouter = require('express').Router();
// Bcrypt, jwt for hashing and creating web token
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// import user model from ../models/User.js
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../config/validation');

authRouter.post('/register', registerValidation, async (req, res, next) => {
    // registerValidation checks if registration data meets the schema requirement
    // Checking if user already exists in our database -- through their email --
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) {
        const error = new Error("Email already exists");
        next(error)
        return res.status(404).send(error.message)
    }

    // Hash passwords using bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Creat new user
    const user = new User({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
    })

    try {
        const savedUser = await user.save();
        res.send(savedUser)
    } catch (error) {
        res.status(404).send(error)
    }
        
})

authRouter.post('/login', loginValidation, async (req, res, next) => {
    // Checking if user already exists in our database -- through their email --
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        const error = new Error("Invalid Email"); /* change error message to "Invalid username or email." */
        next(error);
        return res.status(404).send(error.message)
    }

    // checking if password matches wiht bcrypt.compare
    const validPassword =  await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        const error = new Error("Invalid Password");
        next(error);
        return res.status(404).send(error.message)
    }

    // create web token with jwt
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)  /* add expires in */
    // Set response header
    res.header('auth-token', token);
    // res.status(200).send(`Success: ${token}`) 
    res.status(200).send(`${token}`) /* send this instead */
})

module.exports = authRouter

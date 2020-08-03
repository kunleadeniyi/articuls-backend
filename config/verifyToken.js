const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // check if there is any token in the request header
    const token = req.header('auth-token');
    if (!token) {
        const error = new Error('No token set in request header');
        next(error);
        return res.status(404).send(error.message)
    }

    // check if token is valid
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified; /* verified is going to give us the payload back (the {_id}) */
        next()
    } catch (err) {
        next(err)
        res.status(404).send('Invalid Token');
    }
};

module.exports = {
    verifyToken
};

const express = require('express');

const apiRouter = express.Router();

// mount authRouter on api/user/register route
const authRouter = require("./auth");
apiRouter.use("/user", authRouter);

// mount articleRouter on /articles
const articleRouter = require("./article");
apiRouter.use("/articles", articleRouter);

// mount userRouter on /user
const userRouter = require("./user");
apiRouter.use("/user", userRouter);

module.exports = apiRouter;

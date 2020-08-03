const userRouter = require('express').Router();

const mongoose = require('mongoose');

const User = require('../models/User');
const Article = require('../models/ArticleModel');

const { verifyToken } = require('../config/verifyToken');

// get all user articles
userRouter.get('/myArticles', verifyToken, async (req,res,next) => {
    // userId is in req.user._id
    try {
        // get current loggedIn users
        const loggedInUser = await User.findOne({_id: req.user._id});
        console.log(loggedInUser);
        // convert loggedInUser.articles to a list because it was showing type='object'
        const articleList = Object.values(loggedInUser.articles);
        console.log('ghfdgsfdsf');
        if (!loggedInUser) {
            res.status(404).send("Error finding user")
        } else if (articleList.length == 0) {
            res.status(200).send([])
        } else {
            // find all articles that have their ids in loggedInUser.articles
            const articles = await Article.find({'_id': { $in: articleList}});
            res.status(200).send(articles) /* Returns a list of comments */
        }
    } catch (err) {
        next(err)
        res.status(404).send(err.message)
    }
})

module.exports = userRouter;

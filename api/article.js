/*
create article routes
article schema = {
    title - string
    body - string
    author - **default to current logged in user.name
    upvote - 
    downvote - 
    comment - [] **default to empty array
} 
N.B **Score = upvote - downvote


create article db collection in ../models

do CRUD on article routes

-- private routes -- should require authentication (token verification)
{
    article.post (create article)
    article.delete (delete article)
    article.put (update article)
}

-- public route -- available to all {article.get}
*/
const mongoose = require('mongoose');
const articleRouter = require('express').Router();

const User = require('../models/User');
const Article = require('../models/ArticleModel');
const Comment = require('../models/CommentModel');

const { verifyToken } = require('../config/verifyToken');

articleRouter.param('articleId', async function(req, res, next, articleId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            const error = new Error("Please provide Valid ID")
            next(error)
            return res.status(404).send(error.message)
        }
        const foundArticle = await Article.findById(articleId)
        if (!foundArticle) {
            const error = new Error("Cannot find article")
            next(error)
            res.status(404).send(error.message)
        } else {
            req.article = foundArticle;
            next()
        }
    } catch (error) {
        next(error)
    }
});

articleRouter.get('/', async (req, res, next) => {
    try {
        articles = await Article.find({});
        // will have to apply pagination later
        if (!articles) {
            res.status(404).send(new Error("Error making request"))
        } else {
            res.status(200).send(articles) /* Comes out as a list of objects */
        }
    } catch (err) {
        next(err)
        res.status(404).send(err.message)
    }
})

articleRouter.get('/:articleId', (req, res, next) => {
    res.status(200).send(req.article)
})


articleRouter.post('/', verifyToken, async (req, res, next) => {
    // check if req.body is valid
    if (!req.body.title || !req.body.body) {
        return res.status(400).send("Article not valid") 
    }
    // req.user is gotten from the verifyToken middleware
    // find user
    try {
        const existingUser = await User.findOne({_id: req.user._id});
        const article = new Article({
            title: req.body.title,
            body: req.body.body,
            // author: existingUser.name
            author: existingUser.fullname
        })
    
        const savedArticle = await article.save();
        // put article id in user.articles list
        await User.updateOne({_id: req.user._id}, {$push: {articles: [article._id], $position: 0}})
        res.status(201).send(savedArticle)
    } catch (error) {
        res.status(404).send(error)
    }
})

articleRouter.put('/:articleId', verifyToken, async (req,res,next) => {
    // Check if updated Article in req.body has a title or body
    if (!req.body.title || !req.body.body) {
        return res.status(404).send("Fill both title and body fields")
    }
    try {
        /* Checking if the logged in user is the owner of the article */
        const loggedInUser = await User.findOne({_id: req.user._id})
        const userArticleList = loggedInUser.articles
        // check if articleId is in the userArticleList
        if (!userArticleList.includes(req.params.articleId)) {
            const error = new Error("Cannot edit this article");
            next(error);
            res.status(404).send(error.message)
        } else {
            await Article.updateOne({_id: req.params.articleId}, {$set: {title: req.body.title, body: req.body.body}})
            await Article.findOne({_id: req.params.articleId}, (err, article) => {
                if (err) {
                    throw new Error
                } else {
                    res.status(200).send(article)
                }
            })
        }
    } catch (err) {
        next(err)
    }
})


// Check if logged in user owns article
articleRouter.get('/:articleId/loggedIn', verifyToken, async (req,res,next) => {
    try {
        /* Checking if the logged in user is the owner of the article */
        const loggedInUser = await User.findOne({_id: req.user._id})
        const userArticleList = loggedInUser.articles
        // check if articleId is in the userArticleList
        if (!userArticleList.includes(req.params.articleId)) {
            const error = new Error("Cannot edit this article");
            next(error);
            res.status(404).send(error.message)
        } else {
            res.send(true)
        }
    } catch (err) {
        next(err)
    }
})

// import comment router
const commentRouter = require('./comment');
// mount on articleRouter
articleRouter.use('/:articleId/comments', commentRouter);
// edit article router to delete comments
// edit articlerouter.delete to remove article id in user.articles list on delete.

articleRouter.delete('/:articleId', verifyToken, async (req,res,next) => {
    // check if the article belongs to the user
    const articleId = mongoose.Types.ObjectId(req.params.articleId)
    try {
        const loggedInUser = await User.findOne({_id: req.user._id})
        const userArticleList = loggedInUser.articles
        // check if articleId is in the userArticleList
        if (!userArticleList.includes(req.params.articleId)) {
            const error = new Error("Cannot Delete this article")
            res.status(404).send(error.message)
        } else {
            // delete all comments first
            const currentArticle = await Article.findOne({_id: req.params.articleId});
            const commentList = Object.values(currentArticle.comments);
            if (commentList.length != 0) {
                await Comment.deleteMany({'_id': { $in: commentList}});
            }
            await User.updateOne({_id: req.user._id}, {$pullAll: {articles: [articleId]}})
            await Article.findByIdAndDelete(req.params.articleId);
            // res.status(200).send("Deleted Succesfully");
            res.sendStatus(204)
        }
    } catch(error) {
        res.status(400).send(error.message)
        next(error)
        
    }
})

module.exports = articleRouter;

const commentRouter = require('express').Router({mergeParams: true});

const mongoose = require('mongoose');

const User = require('../models/User');
const Article = require('../models/ArticleModel');
const Comment = require('../models/CommentModel');

const { verifyToken } = require('../config/verifyToken');

commentRouter.param('commentId', async function (req, res, next, commentId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            const error = new Error("Please provide Valid ID")
            next(error)
            return res.status(404).send(error.message)
        }
        const foundComment = await Comment.findById(commentId)
        if (!foundComment) {
            const error = new Error("Cannot find comment")
            next(error)
            res.status(404).send(error.message)
        } else {
            req.comment = foundComment;
            next()
        }
    } catch (error) {
        next(error)
    }
})

// get all comments
commentRouter.get('/', async (req,res,next) => {
    try {
        // get current opened article
        const currentArticle = await Article.findOne({_id: req.params.articleId});
        // convert currentArticle.comments to a list because it was showing type='object'
        const commentList = Object.values(currentArticle.comments);
        if (!currentArticle) {
            res.status(404).send("Error finding article")
        } else if (commentList.length == 0) {
            res.status(200).send([])
        } else {
            // find all comments that have their ids in currentArticle.comments
            const comments = await Comment.find({'_id': { $in: commentList}});
            res.status(200).send(comments) /* Returns a list of comments */
        }
    } catch (err) {
        next(err)
        res.status(404).send(err.message)
    }
})

// create a comment
commentRouter.post('/', verifyToken, async (req,res,next) => {
    // check if comment is valid in req.body
    if (!req.body.body) {
        return res.status(400).send("Comment not valid") 
    }
    try {
        // check if article exists
        const article = await Article.findOne({_id: req.params.articleId}, (err) => {
            if (err) {
                next(err);
            }
        });
        if (article) {
            // create comment
            const existingUser = await User.findOne({_id: req.user._id});
            const comment = new Comment({
                body: req.body.body,
                author: existingUser.fullname
            })
            // Save comment to db
            const newComment = await comment.save()
            // update article.comments list with the new commentId
            await Article.updateOne({_id: req.params.articleId}, {$addToSet: {comments: [comment._id]}})
            res.status(201).send(newComment)
        } else {
            res.send("Cannot find article")
        }
    } catch (err) {
        next(err)
        res.status(404).send(err)
    }
})

// edit a comment
// commentRouter.put('/:commentId', verifyToken, async (req,res,next) => {
    // Oops!! your comment is final!! No vex!!
// })

// delete a comment
commentRouter.delete('/:commentId', verifyToken, async (req,res,next) => {
    const commentId = mongoose.Types.ObjectId(req.params.commentId)
    try {
        // check if article exists
        const article = await Article.findOne({_id: req.params.articleId}, (err) => {
            if (err) {
                next(err);
            }
        });
        if (article) {
            // check if user owns the article
            const loggedInUser = await User.findOne({_id: req.user._id})
            const userArticleList = loggedInUser.articles
            // check if articleId is in the userArticleList
            if (!userArticleList.includes(req.params.articleId)) {
                const error = new Error("Cannot Delete this comment");
                res.status(404).send(error.message)
            } else {
                await Article.updateOne({_id: req.params.articleId}, {$pullAll: {comments: [commentId]}})
                await Comment.findByIdAndDelete(req.params.commentId);
                // res.status(200).send("Deleted Succesfully");
                res.sendStatus(204)
            }
        } else {
            res.send("Cannot find article")
        }
    } catch (err) {
        next(err)
        res.status(404).send(err.message)
    }
})

module.exports = commentRouter;

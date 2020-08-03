const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    author: {type: String},
    upvotedBy: {type: Array, default: []},
    downvotedBy: {type: Array, default: []},
    comments: {type: Array, default: []}, /* [commentSchema] create comment schema */
    dateCreated: {type: Date, default: Date.now}
});

// Virtual for article's URL
articleSchema
.virtual('url')
.get(function () {
  return '/api/articles/' + this._id;
});

module.exports = mongoose.model('Article', articleSchema);
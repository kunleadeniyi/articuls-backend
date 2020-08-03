const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: {type: String, required: true},
    author: {type: String},
    dateCreated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Comment', commentSchema);
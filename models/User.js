const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // name: {type: String, required: true, min: 6},
    first_name: {type: String, required: true, min: 3},
    last_name: {type: String, required: true, min: 3},
    email: {type: String, required: true, min: 6},
    password: {type: String, required: true, min: 6},
    date: {type: Date, default: Date.now},
    articles: { type: Array, default: [] }
});

userSchema
.virtual('fullname')
.get(function () {
  return `${this.first_name[0].toUpperCase()}${this.first_name.slice(1)} ${this.last_name[0].toUpperCase()}${this.last_name.slice(1)}`;
});

module.exports = mongoose.model('User', userSchema);
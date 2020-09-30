const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    twitterId: {
        type: String,
        required: true
    },
    categories: [{name: String, tweetIds: [String]}] 
})

module.exports = mongoose.model('User', userSchema);
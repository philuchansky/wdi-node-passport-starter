const
  mongoose = require('mongoose'),
  tweetSchema = new mongoose.Schema({
    body: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  })

const Tweet = mongoose.model('Tweet', tweetSchema)
module.exports = Tweet
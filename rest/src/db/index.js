// npm packages
const mongoose = require('mongoose');

// Use native promises
mongoose.Promise = global.Promise;

// our packages
const config = require('../../config');

// create connection
const db = mongoose.createConnection(config.mongoUrl);

// create article schema
const ArticleSchema = new mongoose.Schema({
  GameId: {type: Number, index: true},
});

// exports
exports.connectedToDB = new Promise(resolve => db.on('connected', resolve));
exports.db = db;
exports.Article = db.model('Article', ArticleSchema);

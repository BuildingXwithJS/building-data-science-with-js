const {Article} = require('../db');

const fieldsToTake = {
  id: 1,
  title: 1,
  addedDate: 1,
  publishedDate: 1,
  externalUrl: 1,
  snippet: 1,
  author: 1,
  'extracted.keywords': 1,
  'extracted.image': 1,
  summary: 1,
  keywords: 1,
  keyphrases: 1,
  locations: 1,
  organizations: 1,
  people: 1,
  totalSentimentValue: 1,
  totalSentiment: 1,
  score: 1,
};

module.exports = (fastify, options, next) => {
  fastify.get('/game/:id', async req => {
    const {params: {id}} = req;
    const articles = await Article.find({GameId: id}, fieldsToTake);
    return articles;
  });
  next();
};

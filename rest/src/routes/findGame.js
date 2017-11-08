const fetch = require('node-fetch');

const searchUrlBase = 'http://opencritic.com/api/site/search?criteria=';

module.exports = (fastify, options, next) => {
  fastify.post('/search', async req => {
    const {body: {name}} = req;
    const requestUrl = `${searchUrlBase}${encodeURIComponent(name.toLowerCase())}`;
    const results = await fetch(requestUrl).then(r => r.json());
    return results;
  });
  next();
};

const rmq = require('../rmq');

module.exports = (fastify, options, next) => {
  fastify.post('/game', async req => {
    const {body: {name}} = req;
    await rmq.send('opencritic', {game: name});
    return {status: 'success'};
  });
  next();
};

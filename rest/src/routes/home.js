module.exports = (fastify, options, next) => {
  fastify.get('/', (req, reply) => {
    reply.send({hello: 'world'});
  });
  next();
};

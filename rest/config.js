exports.mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/datascience';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};

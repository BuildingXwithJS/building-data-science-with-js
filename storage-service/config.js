// service config
exports.ID = 'storage';
exports.type = 'storage';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};
exports.mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/datascience';

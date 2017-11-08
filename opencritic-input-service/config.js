// service config
exports.ID = 'opencritic';
exports.type = 'input';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};
exports.resultKey = 'store';

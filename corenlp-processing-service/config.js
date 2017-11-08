// service config
exports.ID = 'corenlp';
exports.type = 'processor';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};
exports.resultKey = 'update';
exports.corenlp = {
  url: process.env.CORENLP_URL || 'http://localhost:9000',
};

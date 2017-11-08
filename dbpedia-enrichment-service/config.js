// service config
exports.ID = 'dbpedia';
exports.type = 'enrichment';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};
exports.resultKey = 'enrich';

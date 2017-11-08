// service config
exports.ID = 'fox';
exports.type = 'processor';
exports.rabbit = {
  host: process.env.RABBIT_HOST || 'localhost',
  exchange: 'datascience',
};
exports.resultKey = 'update';
exports.fox = {url: process.env.FOX_URL || 'http://localhost:4444/fox'};

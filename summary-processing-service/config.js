// service config
exports.ID = 'summary';
exports.type = 'processor';
exports.rabbit = {host: process.env.RABBIT_HOST || 'localhost', exchange: 'datascience'};
exports.resultKey = 'update';

// service config
exports.ID = 'keywords';
exports.type = 'processor';
exports.rabbit = {host: process.env.RABBIT_HOST || 'localhost', exchange: 'datascience'};
exports.resultKey = 'update';

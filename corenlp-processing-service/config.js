// service config
exports.ID = 'corenlp';
exports.type = 'processor';
exports.rabbit = {host: 'localhost', exchange: 'datascience'};
exports.resultKey = 'store';
exports.corenlp = {url: 'http://localhost:9000'};

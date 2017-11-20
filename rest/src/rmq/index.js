const Microwork = require('microwork');

const config = require('../../config');

const master = new Microwork(config.rabbit);

module.exports = master;

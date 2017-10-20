// npm packages
const createService = require('microcore');

// our packages
const {annotate} = require('./fox');

// service config
const serviceConfig = require('../config');

module.exports = async () =>
  createService({
    config: serviceConfig,
    onInit() {
      // triggered on service init
      console.log('FOX processing service started!');
    },
    async onJob(data, done) {
      // die if no data
      if (!data) {
        done();
        return;
      }

      // get text from data
      const {_id, text} = data;

      // do not process articles without IDs and text
      if (!text || !_id) {
        done();
        return;
      }
      // run fox
      const result = await annotate(text);
      // return result
      done(null, {_id, ...result});
    },
  });

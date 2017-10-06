// npm packages
const createService = require('microcore');

// our packages
const {sentiments} = require('./corenlp');

// service config
const serviceConfig = require('../config');

module.exports = async () =>
  createService({
    config: serviceConfig,
    onInit() {
      // triggered on service init
      console.log('CoreNLP processing service started!');
    },
    async onJob(data, done) {
      // die if no data
      if (!data) {
        done();
        return;
      }

      // get text from data
      const {id, text} = data;

      // do not process articles without IDs and text
      if (!text || !id) {
        done();
        return;
      }
      // run corenlp
      const result = await sentiments(text);
      // return result
      done(null, {id, ...result});
    },
  });

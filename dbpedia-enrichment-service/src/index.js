// npm packages
const createService = require('microcore');

// our packages
const enrichUsingDbpedia = require('./dbpedia');

// service config
const serviceConfig = require('../config');

module.exports = async () =>
  createService({
    config: serviceConfig,
    onInit() {
      // triggered on service init
      console.log('DBpedia enrichment service started!');
    },
    async onJob(data, done) {
      // die if no data
      if (!data) {
        done();
        return;
      }

      // get text from data
      const {_id, locations, organizations, people} = data;

      // do not process articles without IDs and text
      if (!_id || (!locations && !organizations && !people)) {
        done();
        return;
      }
      // run corenlp
      const result = await enrichUsingDbpedia(data);
      // return result
      done(null, {_id, ...result});
    },
  });

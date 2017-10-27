// npm packages
const fs = require('fs');
const path = require('path');
const test = require('tap');
const Microwork = require('microwork');
const nock = require('nock');

// our packages
const startService = require('../src');
const config = require('../config');

// define rmq configs
const queueConfig = {durable: true, autoDelete: false};
const sendConfig = {persistent: true};

// test data
const inputData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'fox-annotations.json')).toString()
);

// setup nock dbpedia endpoint
const testAbstract = 'test abstract';
const testLabel = 'test label';
const testLink = 'http://test.link';
nock('http://dbpedia.org')
  .get('/sparql/')
  .query(() => true)
  .reply(200, {
    results: {
      bindings: [{abstract: {value: testAbstract}, label: {value: testLabel}, externalLink: {value: testLink}}],
    },
  });

// main tests
test.test('# DBpedia enrichment service', it => {
  let cleanup = () => {};
  let testMaster;

  it.test('Should start service', t => {
    (async () => {
      cleanup = await startService();
      testMaster = new Microwork({host: 'localhost', exchange: 'datascience'});
      t.end();
    })();
  });

  it.test('Should process simple annotations', t => {
    (async () => {
      // listen for reply from workers
      await testMaster.subscribe(
        'enrich',
        data => {
          t.equal(data._id, 'test', 'Has correct id');
          t.equal(data.dbpediaEntities.length, 1, 'Should have one entity');
          t.deepEqual(
            data.dbpediaEntities[0],
            {
              url: inputData.locations[0].url,
              labels: [testLabel],
              abstracts: [testAbstract],
              externalLinks: [testLink],
            },
            'Has correct entity'
          );
          t.end();
        },
        queueConfig
      );
      // send message to workers
      const testData = {_id: 'test', locations: [inputData.locations[0]]};
      await testMaster.send(config.ID, testData, sendConfig);
    })();
  });

  it.test('Should not fail to process broken article', t => {
    (async () => {
      // send message to workers
      await testMaster.send(config.ID, 'asd');
      t.end();
    })();
  });

  it.test('Should cleanup', t => {
    cleanup();
    testMaster.stop();
    t.end();
  });

  it.end();
});

// npm packages
const fs = require('fs');
const path = require('path');
const test = require('tap');
const Microwork = require('microwork');

// our packages
const startService = require('../src');
const config = require('../config');

// define rmq configs
const queueConfig = {durable: true, autoDelete: false};
const sendConfig = {persistent: true};

// test data
const inputData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'input-article.json')).toString()
);

// main tests
test.test('# Keyword extraction processing service', it => {
  let cleanup = () => {};
  let testMaster;

  it.test('Should start service', t => {
    (async () => {
      cleanup = await startService();
      testMaster = new Microwork({host: 'localhost', exchange: 'datascience'});
      t.end();
    })();
  });

  it.test('Should process simple article', t => {
    (async () => {
      // listen for reply from workers
      await testMaster.subscribe(
        'update',
        data => {
          t.equal(data._id, inputData._id, 'Has correct id');
          t.ok(data.keywords, 'Has keywords array');
          t.ok(data.keyphrases, 'Negative', 'Has keyphrases array');
          t.deepEqual(
            data.keywords,
            [
              {keyword: 'game', score: 1},
              {keyword: 'player', score: 0.9230769230769231},
              {keyword: 'Destiny', score: 0.8461538461538461},
              {keyword: 'One', score: 0.7692307692307693},
              {keyword: 'first', score: 0.6923076923076923},
            ],
            'Has correct keywords'
          );
          t.deepEqual(
            data.keyphrases,
            [
              {keyphrase: 'game', score: 1},
              {keyphrase: 'player', score: 0.5866666666666667},
              {keyphrase: 'Destiny', score: 0.5333333333333333},
              {keyphrase: 'missions', score: 0.245},
              {keyphrase: 'first game', score: 0.1575},
            ],
            'Has correct keyphrases'
          );
          t.end();
        },
        queueConfig
      );
      // send message to workers
      await testMaster.send(config.ID, inputData, sendConfig);
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

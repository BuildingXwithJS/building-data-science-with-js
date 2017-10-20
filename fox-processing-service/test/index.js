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
test.test('# FOX processing service', it => {
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
          t.deepEqual(
            data.locations,
            [
              {name: 'Europe', url: 'http://dbpedia.org/resource/Europe'},
              {name: 'Earth', url: 'http://dbpedia.org/resource/Earth'},
            ],
            'Has correct locations'
          );
          t.deepEqual(
            data.organizations,
            [
              {
                name: 'Red Legion',
                url: 'http://aksw.org/notInWiki/RedLegion',
              },
            ],
            'Has correct organizations'
          );
          t.deepEqual(
            data.people,
            [
              {name: 'Bungie', url: 'http://dbpedia.org/resource/Bungie'},
              {
                name: 'Gina Torres',
                url: 'http://dbpedia.org/resource/Gina_Torres',
              },
            ],
            'Has correct people'
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

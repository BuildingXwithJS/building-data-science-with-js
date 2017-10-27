// npm packages
const fs = require('fs');
const path = require('path');
const test = require('tap');
const Microwork = require('microwork');

// our packages
const startService = require('../src');
const {Article} = require('../src/db');

// test data
const inputData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'input-article.json')).toString()
);
const testProcessor = {ID: 'testprocessor', type: 'processor'};
const testEnrichment = {ID: 'testenrichment', type: 'enrichment'};

// sleep fn
const sleep = t => new Promise(r => setTimeout(r, t));

// main tests
test.test('# Storage service', it => {
  let cleanup = () => {};
  let testMaster;
  let savedArticle;

  it.test('Should start service', t => {
    (async () => {
      cleanup = await startService();
      testMaster = new Microwork({host: 'localhost', exchange: 'datascience'});
      t.end();
    })();
  });

  it.test('Should save processor', t => {
    (async () => {
      // send message to workers
      await testMaster.send('microcore.service', testProcessor);
      await testMaster.send('microcore.service', testEnrichment);
      await sleep(500);
      t.end();
    })();
  });

  it.test('Should save simple article', t => {
    (async () => {
      await testMaster.subscribe(testProcessor.ID, async data => {
        const articles = await Article.find();
        t.equal(articles.length, 1, 'Should have 1 article');
        const article = articles[0].toObject();
        t.equal(article.id, inputData.id, 'Should have correct article id');
        t.equal(article.title, inputData.title, 'Should have correct article title');
        t.equal(data.id, inputData.id, 'Should have correct article id');
        t.equal(data.title, inputData.title, 'Should have correct article title');
        t.end();
      });
      // send message to workers
      await testMaster.send('store', inputData);
    })();
  });

  it.test('Should save same article', t => {
    (async () => {
      // send message to workers
      await testMaster.send('store', inputData);
      await sleep(500);
      const articles = await Article.find();
      t.equal(articles.length, 1, 'Should have 1 article');
      const article = articles[0].toObject();
      savedArticle = article._id;
      t.equal(article.id, inputData.id, 'Should have correct article id');
      t.equal(article.title, inputData.title, 'Should have correct article title');
      t.end();
    })();
  });

  it.test('Should update simple article', t => {
    (async () => {
      // send message to workers
      await testMaster.subscribe(testEnrichment.ID, async data => {
        const articles = await Article.find();
        t.equal(articles.length, 1, 'Should have 1 article');
        const article = articles[0].toObject();
        t.equal(article.id, inputData.id, 'Should have correct article id');
        t.ok(article.updated, 'Should have be updated');
        t.ok(data.updated, 'Should have actual data');
        t.end();
      });
      await testMaster.send('update', {_id: savedArticle, updated: true});
    })();
  });

  it.test('Should enrich article', t => {
    (async () => {
      // send message to workers
      await testMaster.send('enrich', {_id: savedArticle, enriched: true});
      await sleep(500);
      const articles = await Article.find();
      t.equal(articles.length, 1, 'Should have 1 article');
      const article = articles[0].toObject();
      t.ok(article.enriched, 'Should have enriched article');
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

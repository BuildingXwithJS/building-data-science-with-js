// npm packages
const Microwork = require('microwork');

// our packages
const config = require('../config');
const {connectedToDB, db, Article} = require('./db');
const logger = require('./logger');

// define rmq configs
const queueConfig = {durable: true, autoDelete: false};

// store the list of processors
const processors = [];

module.exports = async () => {
  // wait for db connection
  await connectedToDB;
  // create task runner
  const runner = new Microwork(config.rabbit);
  // listen for processors info
  await runner.subscribe('microcore.service', serviceInfo => {
    // check if processor already saved
    if (processors.find(p => p.ID === serviceInfo.ID)) {
      return;
    }

    // save new processor
    processors.push(serviceInfo);
    logger.debug('saved new processor:', serviceInfo);
  });
  // listen for save requests
  await runner.subscribe(
    'store',
    async (data, send) => {
      logger.info('Saving new document:', data.id);
      try {
        // create new mongo doc
        const article = new Article(data);
        await article.save();
        // save to processors
        processors.filter(p => p.type === 'processor').forEach(p => {
          logger.debug('Sending article to processor:', p.ID);
          send(p.ID, article.toObject());
        });
      } catch (e) {
        // error for inserting duplicate
        if (e.code === 11000) {
          logger.info('Article already exists:', data.id, 'Ignoring..');
          return;
        }

        logger.error('Error saving article:', e);
      }
    },
    queueConfig
  );

  // listen for update requests
  await runner.subscribe(
    'update',
    async (data, send) => {
      logger.info('Updating document:', data._id);
      await Article.findByIdAndUpdate(data._id, data);
      const updatedDoc = await Article.findById(data._id);
      logger.debug('Updated article:', updatedDoc._id);
      // send for enrichment
      processors.filter(p => p.type === 'enrichment').forEach(p => {
        logger.debug('Sending article to enrichment:', p.ID);
        send(p.ID, updatedDoc.toObject());
      });
    },
    queueConfig
  );

  // listen for update requests
  await runner.subscribe(
    'enrich',
    async data => {
      logger.info('Enrich document:', data._id);
      await Article.findByIdAndUpdate(data._id, data);
      logger.debug('Enriched article:', data._id);
    },
    queueConfig
  );

  // return teardown
  return () => {
    runner.stop();
    db.close();
  };
};

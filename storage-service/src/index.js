// npm packages
const Microwork = require('microwork');

// our packages
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
  const runner = new Microwork({host: 'localhost', exchange: 'datascience'});
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
      // TODO: handle same doc exceptions
      try {
        // create new mongo doc
        const article = new Article(data);
        await article.save();
        // save to processors
        processors.forEach(p => {
          logger.debug('Sending article to:', p.ID);
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
    async data => {
      logger.info('Updating document:', data._id);
      await Article.findByIdAndUpdate(data._id, data);
      logger.debug('Updated article:', data._id);
      // TODO: send for enrichment
    },
    queueConfig
  );

  // return teardown
  return () => {
    runner.stop();
    db.close();
  };
};

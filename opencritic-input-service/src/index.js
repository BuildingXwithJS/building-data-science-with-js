// npm packages
const fetch = require('node-fetch');
const Microwork = require('microwork');
const extractor = require('unfluff');
const cheerio = require('cheerio');

// our packages
const logger = require('./logger');

// config vars
const searchUrlBase = 'http://opencritic.com/api/site/search?criteria=';
const gameInfoBase = 'http://opencritic.com/api/game?id=';

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const getGame = async name => {
  const requestUrl = `${searchUrlBase}${encodeURIComponent(name.toLowerCase())}`;
  const results = await fetch(requestUrl).then(r => r.json());
  const topHit = results[0];
  return topHit;
};

const getExGameData = async gameData => {
  const url = `${gameInfoBase}${gameData.id}`;
  const exGameData = await fetch(url).then(r => r.json());
  return Object.assign({}, gameData, exGameData);
};

const enrichReviewWithText = async review => {
  const pageHTML = await fetch(review.externalUrl).then(r => r.text());
  const result = await extractor(pageHTML);
  if (!result.text || !result.text.length) {
    const $ = cheerio.load(pageHTML);
    const text = $('body').text();
    return Object.assign({}, review, {text, html: pageHTML});
  }
  return Object.assign({}, review, {text: result.text, html: pageHTML, extracted: result});
};

const scrapeReviews = async (data, store) => {
  const {game} = data;
  logger.debug('Searching for:', game);
  const gameData = await getGame(game);
  logger.debug('Got game data:', gameData);
  const exGameData = await getExGameData(gameData);
  logger.debug('Got extended game data:', exGameData);
  const reviews = exGameData.Reviews;
  logger.debug('Processing reviews:', reviews.length);
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    const enrichedReview = await enrichReviewWithText(review);
    logger.debug(`Processed review ${i + 1}, left: ${reviews.length - (i + 1)}`);
    await store(enrichedReview);
    await sleep(1000);
  }
};

module.exports = async () => {
  // create task runner
  const runner = new Microwork({host: 'localhost', exchange: 'datascience'});
  // add worker to specific topic
  await runner.subscribe('opencritic', async (data, reply) => {
    logger.info('Getting reviews for:', data);
    if (typeof data !== 'object' || !data.game || !data.game.length) {
      logger.error('Cannot get game info for:', data);
      return;
    }
    const store = review => reply('store', review);
    scrapeReviews(data, store);
  });
  // return teardown
  return () => runner.stop();
};

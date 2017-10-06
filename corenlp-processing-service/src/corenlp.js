// npm packages
const fetch = require('node-fetch');

// service config
const serviceConfig = require('../config');

// corenlp params
const queryString = 'properties={"annotators": "tokenize,ssplit,sentiment"}&pipelineLanguage=en';

exports.sentiments = async text => {
  const url = `${serviceConfig.corenlp.url}?${encodeURIComponent(queryString)}`;
  const result = await fetch(url, {
    method: 'POST',
    body: text,
  }).then(r => r.json());

  const sentiments = result.sentences.map(s => ({
    sentimentValue: s.sentimentValue,
    sentiment: s.sentiment,
  }));

  const totalSentimentValue = Math.floor(
    sentiments.map(s => parseInt(s.sentimentValue, 10)).reduce((prev, cur) => prev + cur, 0) / sentiments.length
  );
  const totalSentiment = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'][totalSentimentValue];

  return {sentiments, totalSentimentValue, totalSentiment};
};

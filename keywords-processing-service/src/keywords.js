// npm packages
const retext = require('retext');
const keywordsPlugin = require('retext-keywords');
const nlcstToString = require('nlcst-to-string');

const retextProcessor = retext().use(keywordsPlugin);

exports.extractKeywords = async text =>
  new Promise((resolve, reject) => {
    retextProcessor.process(text.replace(/[\n\r]/g, ''), (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      const keywords = result.data.keywords.map(keyword => ({
        keyword: nlcstToString(keyword.matches[0].node),
        score: keyword.score,
      }));

      const keyphrases = result.data.keyphrases.map(phrase => ({
        keyphrase: phrase.matches[0].nodes.map(nlcstToString).join(''),
        score: phrase.score,
      }));

      resolve({keywords, keyphrases});
    });
  });

// npm packages
const SummaryTool = require('node-summary');

exports.generateSummary = text =>
  new Promise((resolve, reject) => {
    SummaryTool.summarize('', text, (err, summary) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({summary});
    });
  });

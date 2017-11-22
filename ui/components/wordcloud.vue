<template>
  <div id="wordcloud"></div>
</template>

<script>
import * as d3 from 'd3';
import cloud from 'd3-cloud';

import stopwords from './stopwords';

const wordCloudConfig = {
  width: 500,
  height: 500,
};

const color = d3.scale
  .linear()
  .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
  .range(['#ddd', '#ccc', '#bbb', '#aaa', '#999', '#888', '#777', '#666', '#555', '#444', '#333', '#222']);

const draw = words => {
  d3
    .select('#wordcloud')
    .append('svg')
    .attr('width', wordCloudConfig.width)
    .attr('height', wordCloudConfig.height)
    .append('g')
    .attr('transform', 'translate(' + wordCloudConfig.width / 2 + ',' + wordCloudConfig.height / 2 + ')')
    .selectAll('text')
    .data(words)
    .enter()
    .append('text')
    .style('font-size', d => d.size + 'px')
    .style('font-family', 'Impact')
    .style('fill', (d, i) => color(i))
    .attr('text-anchor', 'middle')
    .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
    .text(d => d.text);
};

export default {
  props: ['data'],
  mounted() {
    // get all keywords with scores
    const words = this.data
      .filter(article => article.keywords || article.keyphrases || (article.extracted && article.extracted.keywords))
      .map(article =>
        (article.extracted ? article.extracted.keywords || '' : '')
          .split(', ')
          .filter(k => k && k.length)
          .map(k => ({keyword: k, score: 1}))
          .concat(article.keywords || [])
          .concat((article.keyphrases || []).map(p => ({keyword: p.keyphrase, score: p.score})))
      )
      .reduce((acc, cur) => acc.concat(cur), [])
      .filter(k => k.keyword.length > 2)
      .filter(k => !stopwords.includes(k.keyword.replace('’', "'")));

    // calc scores for uniq keywords
    const wordMap = {};
    words.forEach(k => {
      if (wordMap[k.keyword.toLowerCase()]) {
        wordMap[k.keyword.toLowerCase()] += k.score;
      } else {
        wordMap[k.keyword.toLowerCase()] = k.score;
      }
    });

    const topWords = Object.keys(wordMap)
      .filter(k => !stopwords.includes(k.replace('’', "'")))
      .map(keyword => ({
        keyword,
        score: wordMap[keyword],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    const layout = cloud()
      .size([wordCloudConfig.width, wordCloudConfig.height])
      .words(topWords.map(d => ({text: d.keyword, size: 14 + d.score})))
      .padding(5)
      .rotate(function() {
        return ~~(Math.random() * 2) * 90;
      })
      .font('Impact')
      .fontSize(function(d) {
        return d.size;
      })
      .on('end', draw);

    layout.start();
  },
};
</script>

<style>

</style>

<template>
  <svg id="scorechart"></svg>
</template>

<script>
import * as d3 from 'd3';

const chartConfig = {
  width: 1200,
  height: 500,
};

const color = sentiment => {
  console.log(sentiment);
  if (sentiment === 'Negative') {
    return 'red';
  }

  if (sentiment === 'Positive') {
    return 'green';
  }

  return 'steelblue';
};

export default {
  props: ['data'],
  async mounted() {
    const chart = d3
      .select('#scorechart')
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height);

    const y = d3.scale.linear().range([chartConfig.height, 0]);
    const x = d3.scale.ordinal().rangeRoundBands([0, chartConfig.width], 1);

    y.domain([0, d3.max(this.data, d => d.score)]);
    x.domain(this.data.map(d => d.title));

    const barWidth = chartConfig.width / this.data.length;
    const bar = chart
      .selectAll('g')
      .data(this.data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(' + i * barWidth + ',0)');

    bar
      .append('rect')
      .attr('y', d => y(d.score))
      .attr('fill', d => color(d.totalSentiment))
      .attr('height', d => chartConfig.height - y(d.score))
      .attr('width', barWidth - 1);

    bar
      .append('text')
      .attr('x', x.rangeBand() / 2)
      .attr('y', d => y(d.score) + 3)
      .attr('dy', '.75em')
      .text(d => d.score);
  },
};
</script>

<style>
#scorechart text {
  fill: white;
  font: 10px sans-serif;
  text-anchor: middle;
}
</style>

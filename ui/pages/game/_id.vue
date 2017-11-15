<template>
  <div v-if="data && data.length > 0">
    <wordcloud :data="data"></wordcloud>
    <scorechart :data="data"></scorechart>
  </div>
</template>

<script>
import 'isomorphic-fetch';
import Vue from 'vue';
import AsyncComputed from 'vue-async-computed';

// our components
import wordcloud from '~/components/wordcloud';
import scorechart from '~/components/scorechart';

// plugin async computed
Vue.use(AsyncComputed);

export default {
  data() {
    return {
      gameId: this.$route.params.id,
    };
  },
  asyncComputed: {
    async data() {
      return await fetch(`http://localhost:3000/game/${this.gameId}`).then(s => s.json());
    },
  },
  components: {
    wordcloud,
    scorechart,
  },
};
</script>

<style>

</style>

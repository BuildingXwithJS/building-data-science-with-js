<template>
  <div>
    <div v-if="data && data.status !== 'done'">
      This game is still processing, please come back later..
    </div>
    <div v-if="data && data.status === 'done' && data.articles && data.articles.length > 0">
      <h1>{{ gameName }}</h1>
      <wordcloud :data="data.articles"></wordcloud>
      <scorechart :data="data.articles"></scorechart>
    </div>
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
      gameName: this.$route.query.name,
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

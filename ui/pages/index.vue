<template>
  <div>
    <input type="text" placeholder="Find game" v-model="value" @keyup.enter="findGame()">
    <ul>
      <li v-for="game in games" :key="game.id">
        <router-link v-bind:to=" '/game/' + game.id ">{{ game.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  data() {
    return {
      value: '',
      games: [],
    };
  },
  methods: {
    async findGame() {
      if (!this.value || this.value.length < 3) {
        return;
      }
      this.games = await fetch('http://localhost:3000/search', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({name: this.value}),
      }).then(s => s.json());
    },
  },
};
</script>

<style>

</style>

<template>
  <div>
    <h1>Hello {{ name }}!</h1>
    <ul>
      <li v-for="article in data" v-bind:key="article._id">
        <a v-bind:href="article.externalUrl">{{ article.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import 'isomorphic-fetch';

export default {
  async asyncData(context) {
    const data = await fetch('http://localhost:3000/game/4139').then(s => s.json());
    // called every time before loading the component
    return {name: 'World', data};
  },
  // and more functionality to discover
  // ...
};
</script>

<style>
.red {
  color: red;
}
</style>

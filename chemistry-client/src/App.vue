<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@font-face {
  font-family: siyuan;
  src: url("./assets/SourceHanSansCN-Regular.ttf");
}

html{
  height: 100%;
}

#app{
  height: 100%;
  font-family: siyuan;
}

body{
  margin: 0;
  height: 100%;
  box-sizing: border-box;
}


</style>
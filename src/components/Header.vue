<script setup>

</script>

<template>
  <header>
    <p class="topic">Dashboard</p>
    <button class="button_icon"><i class="fas fa-sun"></i></button>
    <button class="button_icon"><i class="fas fa-bell"></i></button>
    <button class="icon-button username_button">
      <img src="../../image/default-avatar-profile-icon-social-media-user-vector-49816613.jpg" class="button_icon" alt="">
      <h3 class="button_text">Username</h3>
    </button>
  </header>
</template>

<style scoped>
header * {
  margin: 0;
  display: flex;
  align-items: center;
}


.topic {
  color: black;
  text-align: left;
  height: auto;
  width: 100%;
  font-size: 1.8rem;
  font-weight: bold;
  font-family: Inter, sans-serif;
  grid-column: 1 / 2;
}

header {
  text-align: left;
  height: 5.188rem;
  width: calc(100% - 6.563rem);
  border: 1px solid #CCCCCC;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  grid-template-rows: 1fr;
  gap: 20px;
  justify-items: start;
  position: fixed;
  padding: 1rem;
  top: 0;
  left: 6.563rem;
  align-items: center;
  box-sizing: border-box;
  background: white;
}

header > * {
  margin: 0;
}

</style>
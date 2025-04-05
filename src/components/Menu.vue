<template>
  <div class="menu">
    <img src="../../image/ChatGPT%20Image%2031.%203.%202025%2011_01_31.png" class="button_icon" alt="">

    <ul class="menu-list">
      <li>
        <button class="button_icon"><i class="fas fa-list"></i></button>
      </li>
      <li>
        <button class="button_icon"><i class="fas fa-check-square"></i></button>
      </li>
      <li>
        <button class="button_icon"><i class="fas fa-clock"></i></button>
      </li>
      <li>
        <button class="button_icon"><i class="fas fa-sticky-note"></i></button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Menu"
};
</script>

<style scoped>
.menu {
  width: 6.563rem;
  height: 100%;
  background-color: #D9D9D9;
  display: grid;
  grid-template-rows: 20% 30%;
  grid-template-columns: 1fr;
  gap: 1rem;
  position: fixed;
  box-sizing: border-box;
  padding: 1rem;
  top: 0;
  left: 0;
}

.menu-list {
  list-style-type: none;
  padding: 0;
  width: 100%;
  grid-column: 1 / 2;
}

.menu-list li {
  width: 100%;
  margin-bottom: 1rem;
}


</style>
<script setup>

</script>
// this component not used in the app
<template>
  <div class="card notes">
    <div class="header">
      <h3>Recent Notes</h3>
      <a href="#">View All →</a>
    </div>
    <div class="note">
      <h4>Notes Text</h4>
      <p>Wednesday, 12.02.2022</p>
    </div>
    <div class="note">
      <h4>Notes Text</h4>
      <p>Wednesday, 12.02.2022</p>
    </div>
    <div class="note">
      <h4>Notes Text</h4>
      <p>Wednesday, 12.02.2022</p>
    </div>
  </div>

</template>

<style scoped>
.note {
  background: #dddddd;
  margin-top: 10px;
  border: 1px solid #CCCCCC;
  border-radius: 5px;
  width: 21.25rem;
  height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 10px;
}

.note:hover {
  background: #e0e0e0;
  cursor: pointer;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.note h4 {
  margin: 1px;
}

.note p {
  font-weight: lighter;
  font-size: 12px;
}
</style>
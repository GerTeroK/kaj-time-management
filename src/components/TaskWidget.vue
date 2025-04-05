<script setup>

</script>

<template>
  <div class="card tasks">
    <div class="header">
      <h3>Today's Tasks</h3>
      <a href="#">View All →</a>
    </div>
    <div class="task">Task Topic <input type="checkbox" name="complete"></div>
    <div class="task">Task Topic <input type="checkbox" name="complete"></div>
    <div class="task">Task Topic <input type="checkbox" name="complete"></div>
    <div class="task">Task Topic <input type="checkbox" name="complete"></div>
  </div>
</template>

<style scoped>
.task {
  background: #dddddd;
  border: 1px solid #CCCCCC;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  width: 21.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task:hover {
  background: #e0e0e0;
  cursor: pointer;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-left: 100px;
  cursor: pointer;
  background: #CCCCCC;
}

.task input[type="checkbox"]:checked {
  background: #4CAF50;
  border: 2px solid #4CAF50;
}


</style>
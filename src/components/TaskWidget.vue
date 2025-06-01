<script setup>

import {changeTaskStatus, findClosestRecurringDay} from "../utils/tools.js";

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})


function onCheckboxChange(task, event) {
  const status = event.target.checked ? 'Complete' : 'In-progress';
  changeTaskStatus(task._id, status);
}


</script>

<template>
  <div class="card tasks">
    <div class="header">
      <h3>Today's Tasks</h3>
      <router-link to="/tasks">View All →</router-link>
    </div>

    <router-link
        v-for="task in props.tasks"
        :key="task._id || task.title"
        class="task"
        :to="{ name: 'Task', params: { id: task._id.toString() } }">
      {{ task.title }}
      <input
          type="checkbox"
          name="complete"
          @click.stop
          @change="onCheckboxChange(task, $event)"
          :checked="task.completed === 'Complete' || findClosestRecurringDay(task.recurringDays)?.completed === 'Complete'"
      />
    </router-link>

    <div v-if="props.tasks.length === 0" class="no-tasks">
      No tasks for today.
    </div>
  </div>
</template>


<style scoped>
.tasks {
  background: #ffffff;
  border: 1px solid #CCCCCC;
  padding: 20px;
  margin-top: 20px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  width: 23rem;
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-tasks {
  text-align: center;
  font-size: 1.2rem;
  color: #888888;
  margin-top: 20px;
}

.task {
  background: #dddddd;
  border: 1px solid #CCCCCC;
  padding: 10px;
  margin-top: 10px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  width: 21.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  color: #333333;
}

.task:hover {
  background: #e0e0e0;
  cursor: pointer;

  -webkit-transform: scale(1.03);
  -ms-transform: scale(1.03);
  transform: scale(1.03);

  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
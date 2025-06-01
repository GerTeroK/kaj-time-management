<template>
  <div class="activities-card">
    <h2>Recent Activities</h2>
    <div class="activities-list">
      <ActivityItem
          v-for="(activity, index) in activities"
          :key="index"
          :time="activity.time"
          :title="activity.title"
          :duration="activity.duration"
          :category="activity.category"
      />
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import ActivityItem from './ActivityItem.vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

props.tasks.sort((a, b) => {
  const dateA = getTaskDate(a);
  const dateB = getTaskDate(b);
  return dateA - dateB;
});

console.log('Sorted Tasks:', props.tasks);

/**
 * Helper function to get the date of a task.
 * For recurring tasks, it returns the date of the first completed day.
 * For one-time tasks, it returns the completion date or creation date.
 */
function getTaskDate(task) {
  if (task.type === 'recurring') {
    const completedDays = task.recurringDays?.filter(d => d.completed === 'Complete' && d.completedAt);
    if (completedDays?.length) {
      return new Date(completedDays[0].completedAt || task.createdAt).getTime();
    }
  } else if (task.type === 'one-time') {
    return new Date(task.completedAt || task.createdAt).getTime();
  }
  return 0;
}

const activities = computed(() => {
  return props.tasks.map(task => {
    const date = getTaskDate(task);
    const dateObj = new Date(date);
    const isValidDate = !isNaN(dateObj.getTime());

    const time = isValidDate
        ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    const day = isValidDate
        ? dateObj.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
        : 'Invalid date';

    console.log('Task Date:', date, 'Formatted Time:', time, 'Formatted Day:', day, 'Task:', task);

    const title = task.title || 'Untitled Task';

    const durationValue = task.times?.reduce((sum, time) => sum + (time.time || 0), 0) || 0;

    const categories = Array.isArray(task.categories) && task.categories.length
        ? task.categories.slice(0, 2).map(cat => typeof cat === 'object' ? cat.name : cat)
        : ['General'];

    return {
      time: `${day} - ${time}`,
      title,
      duration: `${Math.floor(durationValue / 60)}h ${durationValue % 60}m`,
      category: categories
    };
  }).slice(0, 5);
});
</script>

<style scoped>
.activities-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-top: 0;
  font-size: 1.3rem;
  color: #333;
}

.activities-list {
  margin-top: 15px;
}
.activities-list > *:not(:last-child) {
  margin-bottom: 10px;
}
</style>
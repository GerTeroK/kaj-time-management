<template>
  <div class="stats-card">
    <h2>Your Statistics</h2>
    <div class="stats-grid">
      <StatItem icon="⏱️" title="Total Time Tracked" :value="formatTime(stats.totalTime)"/>
      <StatItem icon="✅" title="Tasks Completed" :value="stats.tasksCompleted"/>
      <StatItem icon="📅" title="Current Streak" :value="`${stats.currentStreak} days`"/>
      <StatItem icon="🎯" title="Weekly Goal" :value="`${stats.weeklyGoal}%`"/>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import StatItem from './StatItem.vue';
import {endOfWeek, isWithinInterval, parseISO, startOfWeek} from 'date-fns';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const stats = ref({
  totalTime: calculateTotalTime(props.tasks),
  tasksCompleted: calculateCompletedCount(props.tasks),
  currentStreak: calculateStreak(props.tasks),
  weeklyGoal: calculateWeeklyProductivity(props.tasks)
});

watch(() => props.tasks, (newTasks) => {
  stats.value.totalTime = calculateTotalTime(newTasks);
  stats.value.tasksCompleted = calculateCompletedCount(newTasks);
  stats.value.currentStreak = calculateStreak(newTasks);
  stats.value.weeklyGoal = calculateWeeklyProductivity(newTasks);
}, { immediate: true });

console
.log('Stats:', stats.value);


/** Calculate the total time tracked across all tasks.
 * This includes both one-time tasks and recurring tasks.
 */
function calculateTotalTime(tasks) {
  return tasks
      .flatMap(task => task.times || [])
      .reduce((sum, time) => sum + (time.time || 0), 0);
}

/** Calculate the total number of completed tasks.
 * This includes both one-time tasks and recurring tasks.
 */
function calculateCompletedCount(tasks) {
  return tasks.reduce((count, task) => {
    if (task.type === 'recurring') {
      const completedDays = task.recurringDays?.filter(day => day.completed === 'Complete').length || 0;
      return count + completedDays;
    } else if (task.type === 'one-time') {
      return count + (task.completed === 'Complete' ? 1 : 0);
    }
    return count;
  }, 0);
}

/** Calculate the weekly productivity percentage.
 * This is based on the number of tasks completed this week compared to the total tasks.
 */
function calculateWeeklyProductivity(tasks) {
  const now = new Date();
  const startWeek = startOfWeek(now, {weekStartsOn: 1});
  const endWeek = endOfWeek(now, {weekStartsOn: 1});

  let total = 0;
  let completed = 0;

  for (const task of tasks) {
    if (task.type === 'one-time') {
      const date = task.completedAt || task.endDate || task.createdAt;
      if (!date) continue;

      const taskDate = parseISO(date);
      if (isWithinInterval(taskDate, {start: startWeek, end: endWeek})) {
        total += 1;
        if (task.completed === 'Complete') {
          completed += 1;
        }
      }
    } else if (task.type === 'recurring') {
      for (const day of task.recurringDays || []) {
        const dayIndex = getDayIndex(day.day);
        const currentDate = new Date(startWeek);
        currentDate.setDate(startWeek.getDate() + dayIndex);

        if (isWithinInterval(currentDate, {start: startWeek, end: endWeek})) {
          total += 1;
          if (day.completed === 'Complete') {
            completed += 1;
          }
        }
      }
    }
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getDayIndex(dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(dayName);
}


/** Calculate the current streak of completed tasks.
 * A streak is defined as consecutive days with at least one task completed.
 */
function calculateStreak(tasks) {
  const today = new Date();

  const oneTimeDates = tasks
      .filter(task => task.type === 'one-time' && task.completed === 'Complete' && task.completedAt)
      .map(task => new Date(task.completedAt));

  console.log('One-time Dates:', oneTimeDates);

  const recurringDates = tasks
      .filter(task => task.type === 'recurring' && Array.isArray(task.recurringDays))
      .flatMap(task =>
          task.recurringDays
              .filter(day => day.completed === 'Complete' && day.completedAt)
              .map(day => new Date(day.completedAt))
      );

  console.log('Recurring Dates:', recurringDates);

  const allDates = [...oneTimeDates, ...recurringDates]
      .filter(d => !isNaN(d))
      .sort((a, b) => b - a);

  console.log('All Completed Dates:', allDates);

  let streak = 0;
  let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const completedDate of allDates) {
    const cmpDate = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());

    if (cmpDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (cmpDate < currentDate) {
      break;
    }
  }

  return streak;
}


/** Format seconds into a human-readable string (e.g., "2h 30m").
 * This is used to display the total time tracked.
 */
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  font-size: 1.3rem;
  color: #333;
}

.stats-grid {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 1fr 15px 1fr;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

@media (max-width: 600px) {
  .stats-grid {
    -ms-grid-columns: 1fr;
    grid-template-columns: 1fr;
  }
}

</style>
<template>
  <div class="task-list-section">
    <h3>Speed time on task</h3>
    <div class="task-list-table">
      <table>
        <thead>
        <tr>
          <td colspan="3">
            <div class="header-info">
              <span>Recent</span>
              <span>Total time: {{secondsToHHMMSS(totalTime)}}</span>
            </div>
          </td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(days, taskTitle) in taskTimeByDay" :key="taskTitle">
          <td colspan="3">
            <div v-for="(day, idx) in days" :key="idx" class="task-info">
              <span>{{ taskTitle }}</span>
              <span>{{ day.date }}</span>
              <span>{{ secondsToHHMMSS(day.time) }}</span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '../utils/axiosConfig.js';

const tasks = ref([]);
const totalTime = ref(0);

const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNameToShort = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat'
};
const year = new Date().getFullYear();

async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


const taskTimeByDay = ref({});

/** * Calculate the total time spent on each task by day.
 * This function aggregates time entries for each task and formats them by day.
 */
function calculateTaskTimeByDay() {
  const temp = {};

  tasks.value.forEach(task => {
    if (!temp[task.title]) temp[task.title] = {};

    task.times.forEach(timeEntry => {
      if (!timeEntry.createdAt) return;

      const dateObj = new Date(timeEntry.createdAt);
      const dayLong = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const dayShort = dayNameToShort[dayLong] || dayLong.slice(0, 3);
      const dateLabel = `${dayShort} ${year}`;

      if (task.recurringDays && task.recurringDays.length > 0) {
        task.recurringDays.forEach(recurringDay => {
          if (recurringDay && (recurringDay.completed === 'Complete' || recurringDay.completed === 'Pending')) {
            if (!temp[task.title][dateLabel]) {
              temp[task.title][dateLabel] = 0;
            }
          }
        });
      }

      if (!temp[task.title][dateLabel]) {
        temp[task.title][dateLabel] = 0;
      }
      temp[task.title][dateLabel] += timeEntry.time || 0;
    });
  });

  for (const taskTitle in temp) {
    const daysObj = temp[taskTitle];
    temp[taskTitle] = Object.entries(daysObj).map(([date, time]) => ({ date, time }));
  }

  taskTimeByDay.value = temp;

  totalTime.value = Object.values(taskTimeByDay.value).reduce((acc, times) => {
    return acc + times.reduce((sum, t) => sum + t.time, 0);
  }, 0);
}

/**
 * Convert total seconds to HH:MM:SS format.
 * @param {number} totalSeconds - The total number of seconds.
 * @returns {string} The formatted time string in HH:MM:SS format.
 */
function secondsToHHMMSS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}


if (localStorage.getItem('token')) {
  onMounted(async () => {
    await fetchTasks();
    calculateTaskTimeByDay();
  });
} else {
  console.error('No token found in localStorage. Please log in.');
}

</script>

<style scoped>
.task-list-section {
  background: white;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  padding: 20px;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #CCCCCC;
  margin-top: 20px;
}

.task-list-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  background: #F9F9F9;
  padding: 0 15px;
  -webkit-border-radius: 8px;
  border-radius: 8px;
}

.task-list-table {
  width: 100%;
  overflow-x: auto;
}

.task-list-table table {
  width: 100%;
  border-collapse: collapse;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #EEEEEE;
  -webkit-border-radius: 8px;
  border-radius: 8px;
  margin-top: 10px;
  padding: 0 15px;
  -webkit-transition: background 0.2s;
  transition: background 0.2s;
}

.task-info:hover {
  background: #F5F5F5;
}

.task-info span:first-child {
  flex: 2;
  text-align: left;
  font-weight: 500;
}

.task-info span {
  flex: 1;
  text-align: center;
  color: #555;
}

.task-info span:last-child {
  flex: 1;
  text-align: right;
  color: #4CAF50;
  font-weight: 500;
}

</style>
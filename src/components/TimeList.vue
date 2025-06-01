<script setup>


import { ref } from 'vue';
import apiClient from "../utils/axiosConfig.js";

const tasks = ref([]);
const timeEntries = ref([]);
const totalTime = ref(0);


async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;
    tasks.value.forEach(task => {
      task.times.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    timeEntries.value = tasks.value.flatMap(task =>
        task.times.map(time => ({
          topic: task.title,
          date: time.createdAt,
          time: time.time
        }))
    );

    timeEntries.value.sort((a, b) => new Date(b.date) - new Date(a.date));

    totalTime.value = timeEntries.value.reduce((acc, entry) => acc + entry.time, 0);

  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const day = weekdays[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}, ${hours}:${minutes}, ${year}`;
}

/**
 * Converts total seconds into a formatted string of HH:MM:SS.
 * @param {number} totalSeconds - The total number of seconds to convert.
 * @returns {string} - The formatted time string in HH:MM:SS format.
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
  fetchTasks();
} else {
  console.info('Please log in to view your tasks.');
}

</script>

<template>

  <div class="result-section">
    <h3>Result</h3>
    <div class="result-table">
      <table>
        <thead>
        <tr>
          <td colspan="2" >
            <div class="topic-info">
              <span>Recent</span>
              <span>Total time: {{secondsToHHMMSS(totalTime)}}</span>
            </div>
          </td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in timeEntries.slice(0, 10)" :key="index">
          <td colspan="3">
            <div class="task-time-info">
              <span>{{item.topic}}</span>
              <span>{{formatDate(item.date.toString())}}</span>
              <span>{{secondsToHHMMSS(item.time)}}</span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.result-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #CCCCCC;
}

.result-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.topic-info {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;

  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;

  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;

  height: 30px;
  background: #F9F9F9;
  padding: 5px 15px 5px 15px;
}

.result-table {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.result-table table {
  width: 100%;
  border-collapse: collapse;
}

.task-time-info {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;

  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;

  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;

  height: 30px;
  background: #F9F9F9;
  border: 1px solid #CCCCCC;
  border-radius: 12px;
  margin-top: 10px;
  padding: 5px 15px 5px 15px;
}

.task-time-info span:first-child {
  flex: 2;
  text-align: left;
}

.task-time-info span {
  flex: 1;
  text-align: center;
}

.task-time-info span:last-child {
  flex: 1;
  text-align: right;
}

.task-time-info:last-child {
  margin-top: 0;
}

@media (max-width: 480px) {
  .result-section {
    padding: 15px;
    border-radius: 8px;
  }

  .result-section h3 {
    font-size: 1rem;
    text-align: center;
  }

  .topic-info {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;

    -webkit-box-align: start;
    -ms-flex-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start;

    height: auto;
    padding: 10px;
    gap: 5px;
  }

  .result-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .result-table table {
    min-width: 600px;
    font-size: 12px;
  }

  .task-time-info {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;

    -webkit-box-align: start;
    -ms-flex-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start;

    height: auto;
    padding: 10px;
    gap: 5px;
  }

  .task-time-info span {
    flex: none;
    text-align: left;
    width: 100%;
  }
}

</style>
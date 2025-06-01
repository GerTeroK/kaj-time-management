<script setup>

import {computed, ref, watch} from "vue";
import apiClient from "../utils/axiosConfig.js";


const daysOfWeek = [
  {value: 'Monday', label: 'Mon', count: 0},
  {value: 'Tuesday', label: 'Tue', count: 0},
  {value: 'Wednesday', label: 'Wed', count: 0},
  {value: 'Thursday', label: 'Thu', count: 0},
  {value: 'Friday', label: 'Fri', count: 0},
  {value: 'Saturday', label: 'Sat', count: 0},
  {value: 'Sunday', label: 'Sun', count: 0}
];

const tasks = ref([]);
const activityData = ref([]);
const barHeight = ref([]);
const percent = ref(0);
let progressOffset = ref(0);
const remainders = ref(JSON.parse(localStorage.getItem('reminders') || '[]'));

const remainderError = ref({
  title: '',
  startTime: '',
});

async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;

    console.log('Fetched tasks:', tasks.value);

    const recurringTasks = tasks.value.filter(task => task.type === 'recurring');
    console.log('Filtered times:', recurringTasks);

    const updatedActivity = daysOfWeek.map(day => ({...day, countComplete: 0, maxCount: 0}));

    recurringTasks.forEach(task => {
      task.recurringDays.forEach(rec => {
        const dayIndex = updatedActivity.findIndex(d => d.value === rec.day && (rec.completed === 'Complete' || rec.completed === 'Pending'));
        if (dayIndex !== -1) {
          updatedActivity[dayIndex].countComplete += 1;
        }
      });
    });


    recurringTasks.forEach(task => {
      task.recurringDays.forEach(rec => {
        const dayIndex = updatedActivity.findIndex(d => d.value === rec.day);
        if (dayIndex !== -1) {
          updatedActivity[dayIndex].maxCount += 1;
        }
      });
    });

    activityData.value = updatedActivity;
    console.log('Updated Activity Data:', activityData.value);

    barHeight.value = updatedActivity.map(day => ({
      ...day,
      height: Math.round((day.countComplete / day.maxCount) * 100)
    }));


    percent.value = barHeight.value[(new Date().getDay() + 6) % 7].height;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    progressOffset = computed(() => {
      return circumference - (percent.value / 100) * circumference;
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


console.log(barHeight, 'Bar Height');


if (localStorage.getItem('token') !== null) {
  fetchTasks();
} else {
  console.info('Token found in localStorage, skipping fetchTasks');
}

const title = ref('');
const startTime = ref('');
const priority = ref('medium');
const isFormVisible = ref(false);


/** Function to submit a reminder
 * It validates the form, creates a reminder object, and stores it in localStorage
 */
function submitReminder() {
  const remainder = {
    title: title.value,
    startTime: startTime.value,
    priority: priority.value,
  };


  const existing = JSON.parse(localStorage.getItem('reminders') || '[]');
  console.log('Existing reminders:', existing);
  existing.push(remainder);
  console.log('Updated reminders:', existing);
  localStorage.setItem('reminders', JSON.stringify(existing));


  title.value = '';
  startTime.value = '';
  priority.value = 'medium';
  window.location.reload();
}

// Validate form inputs
function validateForm() {
  remainderError.value = {
    title: '',
    startTime: '',
  };

  const now = new Date();
  const [hours, minutes] = startTime.value.split(':').map(Number);

  const reminderTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
  );

  if (validateLength(title.value, 1, 20)) {
    remainderError.value.title = 'Title must be between 1 and 20 characters.';
  }

  if (reminderTime.getTime() <= now.getTime()) {
    remainderError.value.startTime = 'Start time must be in the future.';
  }

  return !remainderError.value.title && !remainderError.value.startTime;
}

function validateLength(value, min, max) {
  if (value.length < min || value.length > max) {
    return `Must be between ${min} and ${max} characters`
  }
  return ''
}

watch([title, startTime], () => {
  validateForm();
});




</script>

<template>
  <div class="right-panel">
    <div class="card activity">
      <h3>Activity</h3>
      <h2 v-if="barHeight.length === 0" class="help" style="margin-top: 70px">No activity data available.</h2>
      <div class="activity-bars">
        <div v-for="(bar, index) in barHeight" :key="index">
          <div class="bar">
            <div class="bar active" :style="{ height: bar.height ? (6.75 / 100 * bar.height + 'rem') : '0rem'}"></div>
          </div>
        </div>
        <div v-for="(bar, index) in barHeight" :key="index">
          <div class="bar-label">{{ daysOfWeek[index].label }}<br> {{ bar.height ? bar.height : 0 }}%</div>
        </div>
      </div>
    </div>

    <div class="card progress">
      <h3>Today's Progress</h3>
      <div class="progress-content">
        <div class="progress-circle-wrapper">
          <div class="progress-border" :style="{ opacity: percent + '%' }"></div>
          <div class="progress-text">
            <span>{{ percent ? percent : 0 }}%</span>
          </div>
        </div>
        <router-link
            class="view-tasks"
            to="/tasks"
        >View All Tasks
        </router-link>
      </div>
    </div>

    <form v-if="isFormVisible" @submit.prevent="submitReminder" class="reminder-form">
      <div class="row">
        <h2 class="topic">Create remainder</h2>
        <span class="close" @click="isFormVisible = false">&times;</span>
      </div>

      <label>
        Title:
        <input
            type="text"
            :class="{'valid': !remainderError.title && title.length > 0, 'invalid': remainderError.title}"
            v-model="title"
            required
        />
        <p class="ErrorText" v-if="remainderError.title">{{ remainderError.title }}</p>
      </label>

      <label>
        Start Time:
        <input
            type="time"
            :class="{'valid': !remainderError.startTime && startTime.length > 0, 'invalid': remainderError.startTime}"
            v-model="startTime"
            required
        />
        <p class="ErrorText" v-if="remainderError.startTime">{{ remainderError.startTime }}</p>
      </label>

      <label>
        Priority:
        <select v-model="priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <button type="submit">Save</button>
    </form>

    <div class="card remainders">
      <h3>Remainders</h3>
      <h2 v-if="remainders.length === 0" class="help">No reminders have been assigned.</h2>
      <div v-for="(remainder, index) in remainders" :key="index" class="remainder">
        <div class="remainder-time">
          <span class="small-topic">{{ remainder.title }}</span>
          <span>{{ remainder.startTime }}</span>
        </div>
        <span class='priority' :class="remainder.priority">{{ remainder.priority }}</span>
      </div>
      <button class="add-remainder" @click="isFormVisible = !isFormVisible">Add Remainders</button>
    </div>
  </div>
</template>

<style scoped>
.right-panel {
  width: 21.75rem;
  background: #f4f4f4;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: fixed;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  right: 0;
  top: 5.188rem;
  box-sizing: border-box;
}

.activity-bars {
  display: -ms-grid;
  display: grid;
  height: 6.75rem;
  margin-top: 1rem;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: end;
  -ms-flex-align: end;
  align-items: center;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 6.75rem 2.5rem;
}

.activity {
  height: 11.688rem;
}

.bar {
  width: 2.6rem;
  height: 6.75rem;
  background: #D9D9D9;
  font-size: 12px;
  -webkit-border-radius: 12px;
  border-radius: 12px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  position: relative;
}

.bar-label {
  text-align: center;
  font-size: 12px;
  margin-top: 5px;
}

.bar.active {
  background: #4DFF67;
  max-height: 6.75rem;
  z-index: 2;
  position: absolute;
  bottom: 0;
}

.progress-circle-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}

.progress-border {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  border: 10px solid #4DFF67;
  box-sizing: border-box;
  -webkit-transition: opacity 0.3s ease;
  transition: opacity 0.3s ease;
}

.progress-text {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

.card.progress {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.progress-content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  gap: 2.5rem;
  margin-top: 1rem;
}

.view-tasks {
  width: 6.125rem;
  height: 1rem;
  background: black;
  color: white;
  border: none;
  padding: 10px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  font-size: 12px;
}

.view-tasks:hover {
  background: #2C2C2C;
}

/* Remainders */
.remainder {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #CCCCCC;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  margin: 10px 0;
}

.remainders {
  height: calc(100vh - 11.688rem - 20.5rem);
  overflow-y: auto;
  padding: 1rem;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

.priority {
  padding: 2px 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

.priority.medium {
  background: purple;
  color: white;
}

.priority.low {
  background: green;
  color: white;
}

.priority.high {
  background: red;
  color: white;
}

.add-remainder {
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
  border: none;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.add-remainder:hover {
  background: #2C2C2C;
}

.remainder-time {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  gap: 5px;
}

.right-panel h3 {
  margin: 0;
  text-align: center;
}

.reminder-form {
  max-width: 400px;
  width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  justify-content: center;
  position: fixed;
  -webkit-transform: translateX(-160%) translateY(25%);
  transform: translateX(-160%) translateY(25%);
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  -webkit-border-radius: 12px;
  border-radius: 12px;
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 6;
  background: white;
  border: 1px solid #ccc;
  -webkit-transition: transform 0.18s ease;
  transition: transform 0.18s ease;
}

.reminder-form input {
  padding: 8px;
  font-size: 16px;
  width: 95%;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.reminder-form select {
  padding: 8px;
  font-size: 16px;
  width: 100%;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.reminder-form button {
  padding: 10px;
  font-size: 16px;
  background: #4caf50;
  color: white;
  border: none;
  -webkit-border-radius: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.reminder-form button:hover {
  background: #45a045;
}

.close {
  cursor: pointer;
  font-size: 36px;
  color: #333;
  position: absolute;
  right: 10px;
  top: 10px;
  margin: 20px;
}

.topic {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.help {
  font-size: 14px;
  color: #888;
  text-align: center;
  margin-bottom: 10px;
}

.ErrorText {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1em;
}

.valid {
  border-color: #4CAF50;
}

.invalid {
  border-color: #fc3a3a;
}

@media (max-width: 480px) {
  .right-panel {
    position: relative;
    bottom: 0;
    right: 0;
    top: auto;
    width: 100%;
    height: auto;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-around;
    -webkit-box-align: start;
    -ms-flex-align: start;
    align-items: flex-start;
    padding: 1rem;
    overflow-x: auto;
    background: #f4f4f4;
    z-index: 998;
  }

  .remainders {
    height: auto;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
  }

  .activity,
  .card.progress {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }

  .card {
    width: 100%;
    min-height: 180px;
  }

  .activity {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    height: auto;
  }

  .remainder {
    min-width: 45%;
    margin: 5px;
    font-size: 12px;
  }

  .add-remainder {
    width: auto;
    padding: 6px 12px;
    font-size: 12px;
  }
}


</style>
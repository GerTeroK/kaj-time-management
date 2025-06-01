<template>
  <div class="project-container">
    <div class="project-header">
      <label for="task-select"><h1>Select Task:</h1></label>
      <select id="task-select" v-model="selectedTaskId" class="task-select">
        <option value=""></option>
        <option v-for="task in tasks" :key="task._id" :value="task._id">
          {{ task.title }}
        </option>
      </select>
    </div>
    <section id="hourglass-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
        <g id="glass-structure">
          <path style="fill:#F2FAFF;"
                d="M18.5,69.5V60c0-8.376,4.925-16.048,12.546-19.545L32.035,40l-0.989-0.455C23.425,36.048,18.5,28.376,18.5,20v-9.5h43V20c0,8.376-4.925,16.048-12.546,19.545L47.965,40l0.989,0.455C56.575,43.952,61.5,51.624,61.5,60v9.5H18.5z"/>
          <path style="fill:#788B9C;"
                d="M61,11v9c0,8.181-4.81,15.675-12.254,19.091L46.766,40l1.98,0.909C56.19,44.325,61,51.819,61,60v9H19v-9c0-8.181,4.81-15.675,12.254-19.091L33.234,40l-1.98-0.909C23.81,35.675,19,28.181,19,20v-9H61 M62,10H18v10c0,8.879,5.263,16.524,12.837,20C23.263,43.476,18,51.121,18,60v10h44V60c0-8.879-5.263-16.524-12.837-20C56.737,36.524,62,28.879,62,20V10L62,10z"/>
          <polygon style="fill:#8BB7F0;"
                   points="18.5,13.5 18.5,9.5 12.5,9.5 12.5,2.5 67.5,2.5 67.5,9.5 61.5,9.5 61.5,13.5"/>
          <path style="fill:#4E7AB5;" d="M67,3v6h-5h-1v1v3H19v-3V9h-1h-5V3H67 M68,2H12v8h6v4h44v-4h6V2L68,2z"/>
          <polygon style="fill:#8BB7F0;"
                   points="12.5,77.5 12.5,70.5 18.5,70.5 18.5,66.5 61.5,66.5 61.5,70.5 67.5,70.5 67.5,77.5"/>
          <path style="fill:#4E7AB5;" d="M61,67v3v1h1h5v6H13v-6h5h1v-1v-3H61 M62,66H18v4h-6v8h56v-8h-6V66L62,66z"/>
          <rect x="32" y="9" style="fill:#4E7AB5;" width="30" height="1"/>
          <rect x="18" y="9" style="fill:#4E7AB5;" width="9" height="1"/>
          <rect x="32" y="70" style="fill:#4E7AB5;" width="30" height="1"/>
          <rect x="18" y="70" style="fill:#4E7AB5;" width="9" height="1"/>
        </g>

        <!-- Пісок -->
        <g id="sand-group">
          <path id="sandTop" style="fill:#FFC49C;" transform="translate(0, -10)"
                d="M22,30h36c0,14.043-18,18-18,18S22,44.043,22,30z"/>
          <line id="sandStream" style="fill:#FFC49C" x1="40" y1="37" x2="40" y2="43" stroke="#FFC49C" stroke-width="2"
                opacity="0"/>
          <path id="sandBottom" style="fill:#FFC49C;" transform="scale(1,-1) translate(0, -30)"
                d="M22,50h36c0,14.043-18,18-18,18S22,64.043,22,50z"/>
        </g>
      </svg>
    </section>

    <div class="time-tracked">
      <h2>{{ formatTime(elapsedTime) }}</h2>
      <p>Total time tracked today:{{ Math.floor(totalTodayTime / 3600) }}h {{
          Math.floor((totalTodayTime % 3600) / 60)
        }}m</p>
      <div class="buttons">
        <button v-if="!started" @click="startTimer" class="start">Start</button>
        <button v-else @click="stopTimer" class="stop">Stop</button>
        <button v-if="selectedTask" class="fix" @click="fixedTime">Fix</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import apiClient from "../utils/axiosConfig.js";
import {createTime} from "../utils/taskTemplate.js";

const elapsedTime = ref(0);
const flipped = ref(false);
const started = ref(false);
const tasks = ref([]);
const selectedTaskId = ref(null);
const time = ref(createTime());
const totalTodayTime = ref(0);

let secondInterval = null;
let animationInterval = null;
let sandTopAnimation = null;
let sandBottomAnimation = null;
let sandStreamAnimation = null;


async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;

    totalTodayTime.value = tasks.value.map(task => {
      return task.times.reduce((acc, time) => {
        const timeDate = new Date(time.createdAt);
        const today = new Date();
        if (timeDate.getFullYear() === today.getFullYear() &&
            timeDate.getMonth() === today.getMonth() &&
            timeDate.getDate() === today.getDate()) {
          return acc + time.time;
        }
        return acc;
      }, 0);
    }).reduce((acc, curr) => acc + curr, 0);

  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


const selectedTask = computed(() => {
  return tasks.value.find(t => t._id === selectedTaskId.value);
});

watch( () => selectedTaskId.value, () => {
  localStorage.setItem('selectedTaskId', selectedTaskId.value);
})


/**
 * Formats seconds into HH:MM:SS format.
 * @param {number} seconds - The number of seconds to format.
 * @return {string} Formatted time string in HH:MM:SS format.
 */
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

onMounted(() => {
  const savedElapsed = parseInt(localStorage.getItem('timer_elapsed'));
  const startedAt = parseInt(localStorage.getItem('timer_startedAt'));

  if (localStorage.getItem('selectedTaskId')) {
    selectedTaskId.value = localStorage.getItem('selectedTaskId');
  }

  if (!isNaN(savedElapsed) && !isNaN(startedAt)) {
    const now = Date.now();
    const additionalTime = Math.floor((now - startedAt) / 1000);

    elapsedTime.value = savedElapsed + additionalTime;

    startTimer();
  }
  initAnimations();
});

onBeforeUnmount(() => {
  clearInterval(secondInterval);
  clearInterval(animationInterval);
  cancelAnimations();
});

/**
 * Initializes the animations for the hourglass.
 * This function sets up the animations for the top, bottom, and stream of sand in the hourglass.
 * It creates three animations:
 * 1. `sandTopAnimation`: Fades out the top sand over 60 seconds.
 * 2. `sandBottomAnimation`: Fades in the bottom sand over 60 seconds.
 * 3. `sandStreamAnimation`: Creates a continuous stream effect with a fade-in and fade-out over 60 seconds.
 */
function initAnimations() {
  const sandTop = document.getElementById('sandTop');
  const sandBottom = document.getElementById('sandBottom');
  const sandStream = document.getElementById('sandStream');

  if (sandTop && sandBottom && sandStream) {
    sandTopAnimation = sandTop.animate(
        [{opacity: 1}, {opacity: 0}],
        {duration: 60000, easing: 'linear', fill: 'forwards'}
    );
    sandTopAnimation.pause();

    sandBottomAnimation = sandBottom.animate(
        [{opacity: 0}, {opacity: 1}],
        {duration: 60000, easing: 'linear', fill: 'forwards'}
    );
    sandBottomAnimation.pause();

    sandStreamAnimation = sandStream.animate(
        [
          {opacity: 0},
          {opacity: 0.5, offset: 0.5},
          {opacity: 0}
        ],
        {duration: 60000, easing: 'linear', iterations: Infinity}
    );
    sandStreamAnimation.pause();
  }
}

function cancelAnimations() {
  if (sandTopAnimation) sandTopAnimation.cancel();
  if (sandBottomAnimation) sandBottomAnimation.cancel();
  if (sandStreamAnimation) sandStreamAnimation.cancel();
}

/**
 * Flips the hourglass and animates the sand.
 * This function toggles the flipped state of the hourglass, updates the CSS classes,
 * and animates the sand in the top and bottom sections.
 */
function flipHourglass() {
  if (!started.value) return;

  const container = document.getElementById('hourglass-container');
  const sandGroup = document.getElementById('sand-group');
  const sandStream = document.getElementById('sandStream');

  if (!container || !sandGroup || !sandStream) return;

  flipped.value = !flipped.value;
  container.classList.toggle('flipped');
  sandGroup.style.transform = flipped.value ? 'scaleY(-1)' : 'scaleY(1)';
  sandStream.style.opacity = '1';

  const sandTop = document.getElementById('sandTop');
  const sandBottom = document.getElementById('sandBottom');

  if (flipped.value) {
    animateSandTop(sandBottom);
    animateSandBottom(sandTop);
    animateSandStream(sandStream);
    sandGroup.classList.add('sand-group-flipped');
  } else {
    animateSandTop(sandTop);
    animateSandBottom(sandBottom);
    animateSandStream(sandStream);
    sandGroup.classList.remove('sand-group-flipped');
  }
}

function animateSandTop(element) {
  if (sandTopAnimation && element) {
    sandTopAnimation.currentTime = 0;
    sandTopAnimation.play();
  }
}

function animateSandBottom(element) {
  if (sandBottomAnimation && element) {
    sandBottomAnimation.currentTime = 0;
    sandBottomAnimation.play();
  }
}

function animateSandStream(element) {
  if (sandStreamAnimation && element) {
    sandStreamAnimation.currentTime = 0;
    sandStreamAnimation.play();
  }
}

/**
 * Starts the timer and begins the sand animations.
 * This function initializes the timer, updates the elapsed time every second,
 * and manages the sand animations based on the flipped state of the hourglass.
 */
function startTimer() {
  if (started.value) return;

  started.value = true;

  secondInterval = setInterval(() => {
    elapsedTime.value += 1;


    localStorage.setItem('timer_elapsed', elapsedTime.value.toString());
    localStorage.setItem('timer_startedAt', Date.now().toString());

    if (elapsedTime.value % 60 === 0) {
      flipHourglass();
    }
  }, 1000);

  if (
      sandStreamAnimation?.playState === 'paused' ||
      sandBottomAnimation?.playState === 'paused' ||
      sandTopAnimation?.playState === 'paused'
  ) {
    sandStreamAnimation?.play();
    sandBottomAnimation?.play();
    sandTopAnimation?.play();
  } else {
    const sandTop = document.getElementById('sandTop');
    const sandBottom = document.getElementById('sandBottom');
    const sandStream = document.getElementById('sandStream');

    if (!flipped.value) {
      animateSandTop(sandTop);
      animateSandBottom(sandBottom);
      animateSandStream(sandStream);
    } else {
      animateSandTop(sandBottom);
      animateSandBottom(sandTop);
      animateSandStream(sandStream);
    }
  }
}

function stopTimer() {
  started.value = false;
  clearInterval(secondInterval);

  if (sandTopAnimation) sandTopAnimation.pause();
  if (sandBottomAnimation) sandBottomAnimation.pause();
  if (sandStreamAnimation) sandStreamAnimation.pause();
}


/**
 * Fixes the time for the selected task and updates it in the database.
 * This function checks if there is an elapsed time and a selected task,
 * then updates the task with the elapsed time and resets the timer.
 */
async function fixedTime() {
  try {
    if (elapsedTime.value > 0 && selectedTaskId.value) {
      clearInterval(secondInterval);
      started.value = false;


      localStorage.setItem('timer_elapsed', null);
      localStorage.setItem('timer_startedAt', null);

      cancelAnimations();

      const newTime = {
        taskId: selectedTaskId.value,
        time: elapsedTime.value,
        date: new Date().toISOString(),
      };

      elapsedTime.value = 0;

      selectedTask.value.times.push(newTime);

      await apiClient.put(`/tasks/${selectedTaskId.value}`, selectedTask.value);

      time.value.time = 0;
      time.value.createdAt = null;
      window.location.reload();
    }
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

if (localStorage.getItem('token')) {
  fetchTasks();
} else {
  console.info('Please log in to access tasks.');
}
</script>


<style scoped>
svg {
  width: 120px;
  height: 120px;
}

.task-select {
  width: 160px;
  max-height: 150px;
  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;

  font-size: 1rem;
  font-family: Arial, sans-serif;
  color: #333;
  margin-left: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.project-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  font-family: Arial, sans-serif;
}

.project-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

#hourglass-container {
  -webkit-transition: -webkit-transform 1s ease-in-out;
  transition: transform 1s ease-in-out;

  -webkit-transform-origin: center center;
  -ms-transform-origin: center center;
  transform-origin: center center;

  display: flex;
  justify-content: center;
  align-items: center;
}

#hourglass-container.flipped {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}

.time-tracked {
  text-align: center;
  margin-top: 20px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.time-tracked h2 {
  font-size: 1.8rem;
  color: #333;
  margin: 0 0 5px 0;
}

.time-tracked p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

#sandTop,
#sandBottom,
#sandStream {
  -webkit-transform-origin: center center;
  -ms-transform-origin: center center;
  transform-origin: center center;
}

.sand-group-flipped {
  -webkit-transform-origin: center center;
  -ms-transform-origin: center center;
  transform-origin: center center;

  position: absolute;
  top: 50%;
  left: 50%;

  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.start {
  background-color: #4CAF50;
  width: 80px;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
}

.start:hover {
  background-color: #367a39;
}

.fix:hover {
  background-color: #00769a;
}

.fix {
  background-color: #008CBA;
  width: 80px;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
}

.animation-pause {
  animation-play-state: paused;
}

.stop {
  background-color: #f44336;
  width: 80px;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
}

.stop:hover {
  background-color: #d32f2f;
}

</style>

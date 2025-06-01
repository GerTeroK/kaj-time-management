<script setup>
import {computed, ref, watchEffect} from 'vue'


const props = defineProps({
  timeInfos: {
    type: Array,
    default: () => []
  },
  width: {
    type: Number,
    default: 1000
  }
})

const daysOfWeek = [
  {value: 'Monday', label: 'Mon'},
  {value: 'Tuesday', label: 'Tue'},
  {value: 'Wednesday', label: 'Wed'},
  {value: 'Thursday', label: 'Thu'},
  {value: 'Friday', label: 'Fri'},
  {value: 'Saturday', label: 'Sat'},
  {value: 'Sunday', label: 'Sun'}
];
const hourStart = 0
const hourEnd = 24
const hourWidth = 80
const monthHeight = 80;


const tasksByDay = ref({});

watchEffect(() => {
  if (!Array.isArray(props.timeInfos)) return;

  const tasks = [];

  for (const task of props.timeInfos) {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
      tasks.push({
        ...task,
        endTime: "24:00",
      });

      const currentDayIndex = daysOfWeek.findIndex(d => d.value === task.day);
      const nextDay = daysOfWeek[(currentDayIndex + 1) % 7].value;

      tasks.push({
        ...task,
        day: nextDay,
        startTime: "00:00",
        endTime: task.endTime,
      });
    } else {
      tasks.push(task);
    }
  }

  tasksByDay.value = Object.fromEntries(
      daysOfWeek.map(day => [
        day.value,
        tasks.filter(task => task.day === day.value)
      ])
  );
});


// Helper functions to calculate event position and width
function getEventLeft(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number)
  return (hours + minutes / 60) * hourWidth
}

/** * Calculate the width of an event based on its start and end times.
 * If the end time is before the start time, it assumes the event goes past midnight.
 * @param {string} startTime - The start time in "HH:MM" format.
 * @param {string} endTime - The end time in "HH:MM" format.
 * @returns {number} - The width of the event in pixels.
 */
function getEventWidth(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;


  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const durationMinutes = endTotalMinutes - startTotalMinutes;
  return (durationMinutes / 60) * hourWidth;
}
</script>

<template>
  <div :style="{ width: width + 'px' }" class="schedule">
    <div class="row">
      <h3>Schedule</h3>
    </div>

    <div class="table-wrapper">
      <div class="schedule-grid">
        <div class="corner"></div>


        <div class="hours-row">
          <div v-for="hour in (hourEnd - hourStart)" :key="hour" class="hour-cell">
            {{ (hourStart + hour) }}:00
          </div>
        </div>


        <div class="days-column">
          <div v-for="day in daysOfWeek" :key="day.label" class="day-row">
            <div class="day-label">{{ day.label }}</div>
            <div class="day-grid">
              <div v-for="hour in (hourEnd - hourStart)" :key="day.label + '-' + hour" class="hour-slot"></div>


              <div
                  v-for="task in tasksByDay[day.value]"
                  :key="task.title + task.startTime"
                  class="event"
                  :style="{
                  left: `${getEventLeft(task.startTime)}px`,
                  width: `${getEventWidth(task.startTime, task.endTime)}px`,
                }"
              >
                {{ task.title }}
                <span class="tooltip">
                  <strong>{{ task.title }}</strong><br/>
                  Start: {{ task.startTime }}<br/>
                  End: {{ task.endTime }}
                  <br/>
                  Status: {{ task.completed }}<br/>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule {
  background: white;
  padding: 15px;
  border: 1px solid #CCCCCC;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  -webkit-box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  height: max-content;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
  white-space: nowrap;
}

.schedule-grid {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 80px 1fr;
  grid-template-columns: 80px 1fr;
  grid-auto-rows: auto;
  min-width: 2020px;
  border: 2px solid rgba(0.2, 0.2, 0.2, 0.2);
}

.corner {
  background: #f4f4f4;
  width: 80px;
  height: 40px;
}

.hours-row {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 40px;
}

.hour-cell {
  width: 80px;
  text-align: center;
  background: #f4f4f4;
  font-size: 12px;
  line-height: 40px;
  border-left: 1px solid #ddd;
  box-sizing: border-box;
}

.days-column {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.day-row {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 80px 1fr;
  grid-template-columns: 80px 1fr;
  width: 100%;
}

.day-label {
  width: 100%;
  height: 100%;
  text-align: center;
  font-weight: bold;
  background: #f4f4f4;
  border-top: 1px solid #ddd;
}

.day-grid {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: relative;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  height: 80px;
  border-top: 1px solid #ddd;
}

.hour-slot {
  width: 80px;
  -webkit-box-flex: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  height: 100%;
  border-left: 1px solid #eee;
  box-sizing: border-box;
}

.event {
  position: absolute;
  top: 10px;
  height: 60px;
  background: #90CAF9;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  padding: 4px;
  font-size: 10px;
  font-weight: 600;
  color: black;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}

.tooltip {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: left;
  padding: 5px 10px;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  opacity: 0;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
}

.event:hover .tooltip {
  visibility: visible;
  opacity: 1;
  z-index: 8;
}


</style>

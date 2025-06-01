<template>
  <div class="combined-charts">
    <div class="chart-container time-chart">
      <h2>Spend Time for this</h2>
      <div class="period-info">
        <strong>
          <label class="tab" :class="{ activeForTime: types.timeChart === 'Week' }">
            <input type="radio" v-model="types.timeChart" value="Week" />
            Week
          </label>

          <label class="tab" :class="{ activeForTime: types.timeChart === 'Month' }">
            <input type="radio" v-model="types.timeChart" value="Month" />
            Month
          </label>

          <label class="tab" :class="{ activeForTime: types.timeChart === 'Year' }">
            <input type="radio" v-model="types.timeChart" value="Year" />
            Year
          </label>
        </strong>
        <button
            class="import-btn time"
            @click="exportToExcel(dataForChart, 'Time')"
        >
          Export
        </button>
      </div>
      <div class="chart-wrapper">
        <canvas ref="timeChart"></canvas>
      </div>
    </div>

    <div class="chart-container task-chart">
      <h2>Tasks compiled for this</h2>
      <div class="period-info">
        <strong>
          <label class="tab" :class="{ activeForTask: types.taskChart === 'Week' }">
            <input type="radio" v-model="types.taskChart" value="Week" />
            Week
          </label>

          <label class="tab" :class="{ activeForTask: types.taskChart === 'Month' }">
            <input type="radio" v-model="types.taskChart" value="Month" />
            Month
          </label>

          <label class="tab" :class="{ activeForTask: types.taskChart === 'Year' }">
            <input type="radio" v-model="types.taskChart" value="Year" />
            Year
          </label>
        </strong>
        <button class="import-btn task" @click="exportToExcel(dataForChart, 'Task')">Export</button>
      </div>
      <div class="chart-wrapper">
        <canvas ref="taskChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import apiClient from "../utils/axiosConfig.js";
import * as XLSX from "xlsx";

const tasks = ref([]);
const timeChart = ref(null);
const taskChart = ref(null);
let chartInstances = {
  time: null,
  task: null
};

const types = ref({
  timeChart: 'Week',
  taskChart: 'Week'
});

const dataForChart = ref({
  Week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeData: Array(7).fill(0),
    taskData: Array(7).fill(0)
  },
  Month: {
    labels: Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`),
    timeData: Array(31).fill(0),
    taskData: Array(31).fill(0)
  },
  Year: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    timeData: Array(12).fill(0),
    taskData: Array(12).fill(0)
  }
});

async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

/**
 * Fills the chart data based on the tasks fetched.
 * It calculates time spent and task counts for each period (Week, Month, Year).
 * @returns {void}
 * @throws {Error} If tasks data is not in the expected format.
 */
function fillChartData() {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  tasks.value.forEach(task => {
    if (task.times && Array.isArray(task.times)) {
      task.times.forEach(entry => {
        const date = new Date(entry.createdAt);
        const time = entry.time / 3600;

        const weekIndex = (date.getDay() + 6) % 7;
        dataForChart.value.Week.timeData[weekIndex] += time;

        const dayOfMonth = date.getDate() - 1;
        dataForChart.value.Month.timeData[dayOfMonth] += time;

        const monthIndex = date.getMonth();
        dataForChart.value.Year.timeData[monthIndex] += time;
      });
    }

    if (task.type === 'recurring' && Array.isArray(task.recurringDays)) {
      task.recurringDays.forEach(dayEntry => {
        const date = new Date(dayEntry.createdAt || new Date());
        const isValid = ['Complete', 'Pending'].includes(dayEntry.completed);
        if (!isValid) return;

        const weekIndex = weekDays.indexOf(dayEntry.day);
        if (weekIndex >= 0) {
          const adjIndex = (weekIndex + 6) % 7;
          dataForChart.value.Week.taskData[adjIndex]++;
        }

        const dayOfMonth = date.getDate() - 1;
        dataForChart.value.Month.taskData[dayOfMonth]++;

        const monthIndex = date.getMonth();
        dataForChart.value.Year.taskData[monthIndex]++;
      });
    }
  });
}

/**
 * Exports the chart data to an Excel file based on the selected type.
 * @param {Object} dataForChart - The chart data to export.
 * @param {string} type - The type of data to export ('Time' or 'Task').
 * @returns {void}
 */
function exportToExcel(dataForChart, type) {
  console.log(`Exporting data for type: ${type}`, dataForChart);
  const selectedType = type === 'Time' ? types.value.timeChart : types.value.taskChart;
  console.log(`Selected type for export: ${selectedType}`);

  let data;

  switch (selectedType) {
    case 'Week':
      data = dataForChart.Week;
      break;
    case 'Month':
      data = dataForChart.Month;
      break;
    case 'Year':
      data = dataForChart.Year;
      break;
    default:
      data = null;
      console.error('Unknown selectedType:', selectedType);
  }

  console.log(`Exporting ${type} data for ${selectedType}:`, data);

  if (!data) {
    console.error(`Not found: ${selectedType}`);
    return;
  }

  const exportData = data.labels.map((label, index) => ({
    Interval: label,
    Count: type === 'Time' ? data.timeData[index] : data.taskData[index]
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, selectedType);
  XLSX.writeFile(workbook, `${selectedType}_Data.xlsx`);
}

/**
 * Creates a chart using Chart.js.
 * @param {Object} ctxRef - The canvas context reference.
 * @param {string} label - The label for the dataset.
 * @param {Array} data - The data to plot.
 * @param {Array} labels - The labels for the x-axis.
 * @param {string} color - The color of the bars.
 * @param {string} chartType - The type of chart ('time' or 'task').
 * @returns {void}
 */
function createChart(ctxRef, label, data, labels, color, chartType = 'time') {
  const existing = chartInstances[chartType];
  if (existing) existing.destroy();

  chartInstances[chartType] = new Chart(ctxRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: color,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw}${chartType === 'time' ? 'h' : ''}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}${chartType === 'time' ? 'h' : ''}`
          }
        }
      }
    }
  });
}

/**
 * Updates the charts based on the selected time and task types.
 * @returns {void}
 * @throws {Error} If the chart data is not available for the selected types.
 */
function updateCharts() {
  const timeType = types.value.timeChart;
  const taskType = types.value.taskChart;

  createChart(
      timeChart,
      'Hours',
      dataForChart.value[timeType].timeData,
      dataForChart.value[timeType].labels,
      '#4CAF50',
      'time'
  );

  createChart(
      taskChart,
      'Tasks',
      dataForChart.value[taskType].taskData,
      dataForChart.value[taskType].labels,
      '#2196F3',
      'task'
  );
}

watch(types, updateCharts, { deep: true });

onMounted(async () => {
  if (localStorage.getItem('token')) {
    await fetchTasks();
    fillChartData();
    updateCharts();
  }
});
</script>


<style scoped>
.combined-charts {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.chart-container {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 25px;
  -webkit-box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 400px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.time-chart {
  border-top: 4px solid #4CAF50;
}

.task-chart {
  border-top: 4px solid #2196F3;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.period-info {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 12px;
  margin: 15px 0;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

.period-info strong {
  font-size: 1.1rem;
  font-weight: 500;
}

.period-info span {
  font-size: 1rem;
  color: #666;
}

.import-btn {
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.time {
  background-color: #4CAF50;
}

.time:hover {
  background-color: #45a049;
}

.task {
  background-color: #2196F3;
}

.task:hover {
  background-color: #1976D2;
}

.chart-wrapper {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  position: relative;
}

@media (max-width: 768px) {
  .combined-charts {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
  }

  .chart-container {
    height: 350px;
    margin-bottom: 20px;
  }
}

.tab {
  cursor: pointer;
  padding: 8px 16px;
  font-weight: 600;
  color: #666;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.tab input[type="radio"] {
  display: none;
}

.tab.activeForTime {
  color: #4CAF50;
  font-weight: bold;
}

.tab.activeForTime::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4CAF50;
  border-radius: 2px 2px 0 0;
}

.tab.activeForTask {
  color: #007BFF;
  font-weight: bold;
}

.tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 0;
  background-color: #666;
  border-radius: 2px 2px 0 0;
  -webkit-transition: width 0.3s ease;
  -o-transition: width 0.3s ease;
  transition: width 0.3s ease;
}

.tab.activeForTask::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #007BFF;
  border-radius: 2px 2px 0 0;
}

</style>
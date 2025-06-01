<template>
  <div class="trends-card">
    <h2>Productivity Trends</h2>
    <div class="chart-container">
      <canvas ref="trendChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';
import Chart from 'chart.js/auto';

const trendChart = ref(null);
const chartInstance = ref(null);

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
});

const data = ref([]);

/**
 * Calculate productivity by weekday based on tasks.
 * @param {Array} tasks - Array of task objects.
 * @returns {Array} - Array of productivity percentages for each weekday.
 */
function calculateProductivityByWeekday(tasks) {
  const productivity = [0, 0, 0, 0, 0, 0, 0];

  tasks.forEach(task => {
    if (task.type === 'recurring') {
      const completedDays = task.recurringDays?.filter(day => day.completed === 'Complete') || [];
      completedDays.forEach(day => {
        const date = new Date(day.completedAt || day.date);
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        productivity[dayIndex]++;
      });
    } else if (task.type === 'one-time') {
      if (task.completed === 'Complete' && task.completedAt) {
        const date = new Date(task.completedAt);
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        productivity[dayIndex]++;
      }
    }
  });

  const total = productivity.reduce((sum, val) => sum + val, 0);
  if (total === 0) return productivity.map(() => 0);

  return productivity.map(val => Math.round((val / total) * 100));
}


watch(() => props.tasks, (newTasks) => {
  data.value = calculateProductivityByWeekday(newTasks);

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  if (trendChart.value) {
    chartInstance.value = new Chart(trendChart.value, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Productivity',
          data: data.value,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
}, { immediate: true });



  onMounted(() => {
    if (trendChart.value) {
      chartInstance.value = new Chart(trendChart.value, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Productivity',
            data: data.value,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  });
</script>

<style scoped>
.trends-card {
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

.chart-container {
  position: relative;
  height: 250px;
  margin-top: 15px;
}

</style>
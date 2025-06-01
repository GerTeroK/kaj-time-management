<template>
  <div class="chart-card">
    <h2>Time Distribution</h2>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="legend">
      <div v-for="(item, index) in chartData" :key="index" class="legend-item">
        <span class="color" :style="{ backgroundColor: colors[index] }"></span>
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ Math.trunc((item.value / count) * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
});

const chartCanvas = ref(null);
const chartInstance = ref(null);

const chartData = ref([]);
const colors = ref([]);
const count = ref(0);

/**
 * Generates an array of light colors based on the number of categories.
 * @param {number} count - The number of colors to generate.
 * @returns {string[]} An array of HSL color strings.
 */
function generateLightColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    const saturation = 70;
    const lightness = 80;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

/**
 * Updates the chart data based on the provided tasks.
 * It aggregates time spent on each category and prepares the data for the chart.
 * @param {Array} tasks - The list of tasks to process.
 */
function updateChartData(tasks) {
  const tempChartData = [];
  let totalTime = 0;

  tasks.forEach(task => {
    const categories = task.categories || [];
    const taskTimeSum = (task.times || []).reduce((sum, time) => sum + (time.time || 0), 0);

    categories.forEach(category => {
      const categoryName = typeof category === 'string' ? category : category.name;
      let existing = tempChartData.find(item => item.label === categoryName);
      if (existing) {
        existing.value += taskTimeSum;
      } else {
        tempChartData.push({ label: categoryName, value: taskTimeSum });
      }
      totalTime += taskTimeSum;
    });
  });

  chartData.value = tempChartData.filter(item => item.value > 0);
  colors.value = generateLightColors(chartData.value.length || 10);
  count.value = totalTime;
}

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance.value = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: chartData.value.map(item => item.label),
        datasets: [{
          data: chartData.value.map(item => item.value),
          backgroundColor: colors.value,
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
});

watch(() => props.tasks, (newTasks) => {
  updateChartData(newTasks);
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  if (chartCanvas.value && chartData.value.length > 0) {
    chartInstance.value = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: chartData.value.map(item => item.label),
        datasets: [{
          data: chartData.value.map(item => item.value),
          backgroundColor: colors.value,
          borderWidth: 0
        }]
      },
      options: {
        cutout: 70,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}, { immediate: true });


</script>


<style scoped>
.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  font-size: 1.3rem;
  color: #333;
}

.chart-container {
  position: relative;
  height: 200px;
  margin: 20px 0;
}

.legend {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  gap: 15px;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}

.legend-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.label {
  color: #666;
}

.value {
  font-weight: bold;
}

</style>
<template>
  <div class="activity-item">
    <div class="time">{{ time }}</div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="meta">
        <span class="duration">{{ duration }}</span>
        <span
            class="category"
            v-for="(cat, index) in category"
            :key="index"
            :class="cat"
            :style="{ background: colorPairs[index % colorPairs.length].background, color: colorPairs[index % colorPairs.length].text }"
        >
          {{ cat }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";

defineProps({
  time: String,
  title: String,
  duration: String,
  category: [String, Array]
});

const colorPairs = ref()
colorPairs.value = generateColorPairs(2);


/**
 * Generates an array of color pairs for background and text colors.
 * Each pair is based on a hue that is evenly distributed across the color wheel.
 * @param {number} count - The number of color pairs to generate.
 * @returns {Array} An array of objects containing background and text colors.
 */
function generateColorPairs(count) {
  const colorPairs = [];

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i + 100);

    const background = `hsl(${hue}, 70%, 95%)`;
    const text = `hsl(${hue}, 70%, 30%)`;

    colorPairs.push({ background, text });
  }

  return colorPairs;
}
</script>

<style scoped>
.activity-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.time {
  font-size: 0.8rem;
  color: #666;
  min-width: 100px;
}

.content {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

.title {
  font-weight: 500;
}

.meta {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 10px;
  margin-top: 5px;
  font-size: 0.8rem;
}

.duration {
  color: #666;
}

.category {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  text-transform: capitalize;
}


</style>
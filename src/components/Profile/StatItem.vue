<template>
  <div class="stat-item">
    <div class="icon">{{ icon }}</div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  value: [String, Number]
});
</script>

<style scoped>
.stat-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.icon {
  font-size: 1.5rem;
}

.content {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

.title {
  font-size: 0.9rem;
  color: #666;
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

</style>
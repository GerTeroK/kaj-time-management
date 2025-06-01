<template>
  <div class="profile-page">
    <ProfileHeader :tasks="tasks"/>
    <div class="profile-content">
      <div class="left-column">
        <UserStats :tasks="tasks"/>
        <RecentActivities :tasks="tasks" />
      </div>
      <div class="right-column">
        <TimeDistributionChart :tasks="tasks" />
        <ProductivityTrends :tasks="tasks" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProfileHeader from '../components/Profile/ProfileHeader.vue';
import UserStats from '../components/Profile/UserStats.vue';
import RecentActivities from '../components/Profile/RecentActivities.vue';
import TimeDistributionChart from '../components/Profile/TimeDistributionChart.vue';
import ProductivityTrends from '../components/Profile/ProductivityTrends.vue';
import apiClient from "../utils/axiosConfig.js";

import { ref, onMounted } from 'vue';
import {fetchTasks} from "../utils/tools.js";



const tasks = ref([]);

onMounted(async () => {
  tasks.value = await fetchTasks();
});


</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>
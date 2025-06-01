<script setup>
import RightPanel from "../components/RightPanel.vue";
import TaskWidget from "../components/TaskWidget.vue";
import Schedule from "../components/Schedule.vue";
import apiClient from "../utils/axiosConfig.js";
import {onMounted, onUnmounted, ref} from "vue";


const timeInfos = ref([]);
const todayTasks = ref([]);

const today = new Date();
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


onMounted(async () => {
  if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {

    try {
      const response = await apiClient.get('/tasks/times');
      timeInfos.value = response.data;
      console.log('Time Infos:', timeInfos.value);
    } catch (error) {
      console.error('Error fetching time infos:', error);
    }

    try {
      const response = await apiClient.get(`/tasks/by-day/${daysOfWeek[today.getDay()]}`);
      todayTasks.value = response.data;
      console.log('Today Tasks:', todayTasks.value);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    }
  }
});




</script>

<template>
  <div class="widgets">
    <TaskWidget :tasks="todayTasks"/>
  </div>
  <Schedule :time-infos="timeInfos"/>
  <RightPanel/>
</template>

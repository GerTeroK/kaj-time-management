<script setup>

import Schedule from "../components/Schedule.vue";
import TaskList from "../components/TaskList.vue";
import {onMounted, ref} from "vue";
import apiClient from "../utils/axiosConfig.js";

const timeInfos = ref([])

if (localStorage.getItem('token')) {
  onMounted(async () => {
    try {
      const response = await apiClient.get('/tasks/times')
      timeInfos.value = response.data
      console.log('Time Infos:', timeInfos.value)
    } catch (error) {
      console.error('Error fetching time infos:', error)
    }
  });
}


</script>

<template>
  <Schedule :time-infos="timeInfos" :width="1400"/>
  <TaskList/>
</template>

<style scoped>

</style>
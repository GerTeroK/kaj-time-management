<template>
    <TimeSpentChart />
    <TaskSpendTimeList />
</template>

<script>
import TimeSpentChart from '../components/CombinedCharts.vue'
import TaskSpendTimeList from "../components/TaskSpendTimeList.vue";

export default {
  components: {
    TaskSpendTimeList,
    TimeSpentChart,
  }
}
</script>

<style scoped>

</style>
<template>
  <div id="app">
    <Notification ref="notification"/>
    <Menu/>
    <div class="main-content">
      <Header/>
      <div class="content-layout">
      <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Menu from '/src/components/Menu.vue'
import Header from '/src/components/Header.vue'
import Notification from "./components/Notification.vue";
import { onMounted, ref } from "vue";

const notification = ref(null)

/** * Checks the local storage for reminders and shows notifications for those that are due.
 * It also removes reminders that have already been shown.
 */
function checkRemainders() {
  const remainders = JSON.parse(localStorage.getItem('reminders') || '[]')
  const now = new Date()

  const remaining = []

  remainders.forEach(remainder => {
    const [hours, minutes] = remainder.startTime.split(':').map(Number);

    const reminderTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
    );
    if (reminderTime.getTime() <= now.getTime()) {
      notification.value?.showNotification(
          remainder.title,
          remainder.priority || 'low',
          5000
      )
    } else {
      remaining.push(remainder)
    }
  })

  if (remainders.length === remaining.length) return
  localStorage.setItem('reminders', JSON.stringify(remaining))
}

onMounted(() => {
  checkRemainders()
})

setInterval(() => {
  checkRemainders()
}, 30000)
</script>


<style scoped>
#app {
  display: flex;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
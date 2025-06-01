<template>
  <div v-if="visible" class="notification" :class="priority">
    {{ message }}
  </div>
</template>

<script setup>
import {ref} from 'vue';

const visible = ref(false);
const message = ref('');
const priority = ref('low');
const audio = new Audio('public/sound/new_message_tone.mp3');

console.log(audio, 'Audio Object');

/** Show a notification with a message and type.
 * @param {string} msg - The message to display.
 * @param {string} msgType - The type of the message (low, medium, high).
 * @param {number} duration - Duration in milliseconds before the notification disappears.
 */
function showNotification(msg, msgType = 'info', duration = 6000) {
  message.value = msg;
  priority.value = msgType;
  visible.value = true;

  try {
    if (localStorage.getItem('audio_allowed') === 'true' && localStorage.getItem('notification_allowance') === 'true') {
      audio.currentTime = 0;
      audio.play();
    }
  } catch (err) {
    console.warn('Sound is not play:', err);
  }

  setTimeout(() => {
    visible.value = false;
    window.location.reload();
  }, duration);
}

defineExpose({showNotification});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 12px 20px;
  -webkit-border-radius: 8px;
  border-radius: 8px;
  color: #fff;
  z-index: 9999;
  -webkit-box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  min-width: 250px;
  max-width: 80%;
  text-align: center;
}

.notification.low {
  background-color: #bae3c2;
  color: #155724;
}

.notification.medium {
  background-color: #e8bcff;
  color: #6f42c1;
}

.notification.high {
  background-color: #f8bbc0;
  color: #721c24;
}


</style>

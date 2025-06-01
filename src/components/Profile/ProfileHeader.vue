<template>
  <div class="profile-header">
    <div class="avatar-section">
      <img :src="`http://localhost:3000${user.avatarUrl}`" alt="Profile" class="avatar">

      <button @click="triggerFileInput" class="edit-button">Change Photo</button>

      <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          style="display: none"
          accept="image/*"
      />
    </div>
    <div class="info-section">
      <h1>{{ user.name }}</h1>
      <p class="email">{{ user.email }}</p>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ daysActive }}</span>
          <span class="stat-label">Days Active</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Tasks Done</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ productivity }}%</span>
          <span class="stat-label">Productivity</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import axios from 'axios';

const user = ref({});
let completedCount = ref(0);
let totalCount = ref(0);
let productivity = ref(0);
let daysActive = ref(0);


const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

console.log('Tasks:', props.tasks);

watch(
    () => props.tasks,
    (newTasks) => {
      completedCount.value = newTasks.reduce((count, task) => {
        if (task.type === 'recurring') {
          const completedDays = task.recurringDays?.filter(day => day.completed === 'Complete').length || 0;
          return count + completedDays;
        } else if (task.type === 'one-time') {
          return count + (task.completed === 'Complete' ? 1 : 0);
        }
        return count;
      }, 0);

      totalCount.value = newTasks.reduce((count, task) => {
        if (task.type === 'recurring') {
          return count + (task.recurringDays?.length || 0);
        } else if (task.type === 'one-time') {
          return count + 1;
        }
        return count;
      }, 0);

      productivity.value = totalCount.value > 0
          ? Math.round((completedCount.value / totalCount.value) * 100)
          : 0;
    },
    { immediate: true }
);

watch(
    () => user.value,
    (newUser) => {
      if (newUser.createdAt) {
        daysActive.value = daysSince(newUser.createdAt.toString());
        console.log('Days Active:', daysActive);
      }
    },
    { immediate: true }
);

console.log('Completed Count:', completedCount.value);
console.log('Total Count:', totalCount.value);


onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    console.log('user:', user.value);
    daysActive.value = daysSince(user.value.createdAt.toString());
  }
});

/** Calculate the number of days since a given date
 * @param {string} dateString - The date in string format (e.g., '2023-01-01')
 * @returns {number} - The number of days since the given date
 */
function daysSince(dateString) {
  console.log('Calculating days since:', dateString);
  const fromDate = new Date(dateString);
  const today = new Date();

  fromDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  console.log('From Date:', fromDate, 'Today:', today);

  const diffInMs = today - fromDate;
  console.log('Difference in milliseconds:', diffInMs);
  return Math.floor((diffInMs / (1000 * 60 * 60 * 24)) + 1);
}

const fileInput = ref(null);

function triggerFileInput() {
  fileInput.value.click();
}


/** Handle file input change event to upload the avatar
 * @param {Event} event - The change event from the file input
 */
async function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file || !user.value.email) return;

  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('email', user.value.email);

  try {
    const res = await axios.post('http://localhost:3000/users/change-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    user.value = res.data.user;
    localStorage.setItem('user', JSON.stringify(user.value));
  } catch (err) {
    console.error('Upload failed', err);
  }
}



</script>


<style scoped>
.profile-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 30px;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  border: 3px solid #4CAF50;
}

.edit-button {
  display: block;
  margin-top: 10px;
  background: #f5f5f5;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.info-section h1 {
  margin: 0;
  font-size: 1.8rem;
}

.email {
  color: #666;
  margin: 5px 0 15px;
}

.stats {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 600px) {
  .profile-header {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    text-align: center;
  }

  .stats {
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
  }
}

</style>
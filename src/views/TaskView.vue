<script setup>
import {computed, ref} from 'vue';
import apiClient from "../utils/axiosConfig.js";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;
const task = ref(null);

async function fetchTasks(id) {
  try {
    const response = await apiClient.get(`/tasks/by-id/${id}`);
    task.value = response.data;
    console.log('Fetched task:', task.value);
  } catch (error) {
    console.error('Error fetching task:', error);
  }
}

function onCheckboxChange(subtask, event) {
  subtask.completed = event.target.checked;
  fetchCompleteStatus(subtask, task.value._id);
}

async function fetchCompleteStatus(subtask, taskId) {
  try {
    const response = await apiClient.get(`/tasks/by-id/${taskId}`);
    const updatedTask = response.data;
    const subtaskIndex = updatedTask.subtasks.findIndex(s => s._id === subtask._id);
    if (subtaskIndex !== -1) {
      updatedTask.subtasks[subtaskIndex].completed = subtask.completed;
      await apiClient.put(`/tasks/${taskId}`, updatedTask);
      console.log('Subtask updated:', updatedTask.subtasks[subtaskIndex]);
    } else {
      console.error('Subtask not found in task subtasks');
    }
  } catch (error) {
    console.error('Error updating subtask:', error);
  }
}

const completedSubtasks = computed(() => {
  return task.value.subtasks.filter(subtask => subtask.completed).length;
});

const completionPercentage = computed(() => {
  return (completedSubtasks.value / task.value.subtasks.length) * 100;
});

fetchTasks(id);
</script>

<template>
  <div class="task-app">
    <div v-if="task" class="task-container">
      <div class="task-header">
        <h1 class="task-main-title">Task Detail</h1>
        <h2 class="task-topic">{{ task.title }}</h2>
        <p class="task-description">{{ task.description }}</p>
      </div>

      <div class="categories-section">
        <h3 class="section-title">Categories</h3>
        <div class="categories-scroller">
          <span
              v-for="(category, index) in task.categories"
              :key="index"
              class="category-tag"
          >
            {{ category.name }}
          </span>
        </div>
      </div>

      <div class="subtasks-section">
        <h3 class="section-title">Sub Tasks</h3>
        <div class="subtasks-list">
          <div
              v-for="(subtask, index) in task.subtasks"
              :key="index"
              class="subtask-item"
          >
            <label class="checkbox-container">
              <input
                  type="checkbox"
                  v-model="subtask.completed"
                  @change="onCheckboxChange(subtask, $event)"
                  :checked="subtask.completed"
              >
              <span class="checkmark"></span>
              <span class="subtask-text">{{ subtask.title }}</span>
            </label>
          </div>
        </div>
        <div class="progress-bar">
          <div
              class="progress-fill"
              :style="{ width: completionPercentage + '%' }"
          ></div>
          <span class="progress-text">{{ completedSubtasks }} of {{ task.subtasks.length }} completed</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-app {
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  max-width: 1400px;
  padding: 2rem;
  color: #2d3748;
}

.task-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.task-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.task-main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.task-topic {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.task-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

/* Категорії */
.categories-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.categories-scroller {
  display: flex;
  overflow-x: auto;
  gap: 0.8rem;
  padding-bottom: 0.5rem;
}

.category-tag {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  color: #1a365d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Підзавдання */
.subtasks-section {
  margin-bottom: 1rem;
}

.subtasks-list {
  margin-bottom: 1.5rem;
}

.subtask-item {
  margin-bottom: 0.8rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding-left: 2rem;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 1.25rem;
  width: 1.25rem;
  background-color: #fff;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #f7fafc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #4299e1;
  border-color: #4299e1;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.subtask-text {
  font-size: 1rem;
  color: #2d3748;
  transition: color 0.2s;
}

.checkbox-container input:checked ~ .subtask-text {
  color: #718096;
  text-decoration: line-through;
}

/* Прогрес бар */
.progress-bar {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4299e1;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  font-size: 0.85rem;
  color: #718096;
  margin-top: 0.5rem;
  text-align: right;
}

/* Смуга прокрутки */
.categories-scroller::-webkit-scrollbar {
  height: 5px;
}

.categories-scroller::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.categories-scroller::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.categories-scroller::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (max-width: 768px) {
  .task-app {
    padding: 1rem;
  }

  .task-container {
    width: 100%;
    padding: 1.5rem;
  }
}
</style>
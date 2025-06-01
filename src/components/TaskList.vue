<script setup>
import DropMenu from "./DropMenu.vue";
import {nextTick, reactive, ref, watch} from "vue";
import {createDaysTime, createOneTimeTask, createRecurringTask, createSubtask} from "../utils/taskTemplate.js"
import apiClient from '../utils/axiosConfig';
import {createCategory} from "../utils/categoryTemplate.js";
import {changeTaskStatus} from "../utils/tools.js";

const isModalOpen = ref(false);
const newSubtask = ref('');
const daysOfWeek = [
  {value: 'Monday', label: 'Mon'},
  {value: 'Tuesday', label: 'Tue'},
  {value: 'Wednesday', label: 'Wed'},
  {value: 'Thursday', label: 'Thu'},
  {value: 'Friday', label: 'Fri'},
  {value: 'Saturday', label: 'Sat'},
  {value: 'Sunday', label: 'Sun'}
];

const taskError = ref({
  title: '',
  description: '',
  date: '',
  recurringDay: '',
  category: '',
  subtask: ''
});


const tasks = ref([]);
let times = ref([]);
const categories = ref([]);
const taskIdForUpdate = ref(null);

const task = reactive(createOneTimeTask());
const subtask = reactive(createSubtask());
const daysTime = reactive(createDaysTime());
let category = reactive(createCategory());


const selectedCategory = ref('');
const showNewCategoryInput = ref(false);
let isSubmitting = ref(false);
const newCategoryName = ref('');

function onCategorySelect() {
  if (selectedCategory.value === 'new') {
    showNewCategoryInput.value = true;
  } else {
    showNewCategoryInput.value = false;
    task.category = selectedCategory.value;
  }
}

/**
 * Returns the completed status of the recurring day that matches today's date.
 * If no matching day is found, returns an empty string.
 * @param {Object} task - The task object containing recurring days.
 * @returns {string} - 'true', 'false', or an empty string.
 */
function selectedRecurringDayCompleted(task) {
  const todayIndex = new Date().getDay();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!task.recurringDays || !task.recurringDays.length) return '';

  const dayMap = task.recurringDays.reduce((map, day) => {
    map[day.day] = day;
    return map;
  }, {});

  for (let i = 0; i < 7; i++) {
    const index = (todayIndex + i) % 7;
    const dayName = daysOfWeek[index];

    if (dayMap[dayName] && typeof dayMap[dayName].completed !== 'undefined') {
      return dayMap[dayName].completed.toString();
    }
  }

  return '';
}

/**
 * Changes the task type between 'one-time' and 'recurring'.
 * It creates a new task object based on the current task type
 * and copies over the relevant properties.
 */
function changeTaskType() {
  const newTask =
      task.type === 'one-time' ? createOneTimeTask() : createRecurringTask();

  newTask.title = task.title;
  newTask.description = task.description;
  newTask.priority = task.priority;
  newTask.categories = task.categories;
  newTask.subtasks = task.subtasks;

  Object.assign(task, newTask);
}


function openModal() {
  isModalOpen.value = true;
}

/**
 * Toggles the category for the task.
 * If the category is not already in the task's categories, it adds it.
 * If it is already present, it removes it.
 * @param {string} categoryId - The ID of the category to toggle.
 */
function toggleCategory(categoryId) {
  const index = task.categories.indexOf(categoryId);
  if (index === -1) {
    task.categories.push(categoryId);
  } else {
    task.categories.splice(index, 1);
  }
}

function closeModal() {
  isModalOpen.value = false;
  taskIdForUpdate.value = null;
  resetForm();
}

function resetForm() {
  Object.assign(task, {
    title: '',
    description: '',
    type: 'one-time',
    priority: 'medium',
    category: '',
    // image: null,
    // imagePreview: '',
    startDate: '',
    endDate: '',
    recurringDays: [],
    recurringTime: '',
    subtasks: []
  });
  newSubtask.value = '';
}

/**
 * Adds a new recurring day with the specified start and end times.
 * It checks if the day is already present in the task's recurring days
 * before adding it.
 */
function addNewDayTime() {
  if (daysTime.days.length && daysTime.startTime && daysTime.endTime && taskError.value.recurringDay === '') {
    for (const day of daysTime.days) {
      if (!task.recurringDays.some(d => d.days === day)) {
        task.recurringDays.push({
          day: day,
          startTime: daysTime.startTime,
          endTime: daysTime.endTime
        });
      }
    }

    daysTime.days = [];
    daysTime.startTime = '';
    daysTime.endTime = '';
  }
}

/**
 * Adds a new subtask to the task's subtasks array.
 * It checks if the subtask title is valid and not empty before adding it.
 */
function addSubtask() {
  subtask.title = newSubtask.value.trim();
  if (subtask.title && taskError.value.subtask === '') {
    task.subtasks.push({...subtask});
    newSubtask.value = '';
  }
}

function removeSubtask(index) {
  task.subtasks.splice(index, 1);
}

/**
 * Submits the task to the server.
 * It prepares the task data, including categories and recurring days,
 * and sends it to the API. If updating an existing task, it uses the taskIdForUpdate.
 */
async function submitTask() {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {

    if (task.type === 'recurring') {
      task.recurringDays = task.recurringDays.map(day => ({
        ...day,
        startTime: day.startTime,
        endTime: day.endTime,
        title: task.title,
      }));
    }

    const preparedTask = {...task};

    preparedTask.categories = categories.value.filter(name => task.categories.includes(name)).map(name => ({
      name,
      tasks: []
    }));

    if (taskIdForUpdate.value !== null) {
      await updateTask(taskIdForUpdate.value, preparedTask);
      taskIdForUpdate.value = null;
      return;
    }
    const {data: savedTask} = await apiClient.post(`/tasks`, preparedTask);

    savedTask.categories = savedTask.categories.map(category => ({
      ...category,
      tasks: [savedTask._id]
    }));

    await apiClient.put(`/tasks/${savedTask._id}`, savedTask);

    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error saving task:', error);
  } finally {
    isSubmitting = false;
  }
}

/**
 * Fetches the recurring days from the server and updates the times variable.
 * It handles errors by logging them to the console.
 */
async function fetchRecurringDays() {
  try {
    const response = await apiClient.get('/tasks/times');
    times = response.data;
  } catch (error) {
    console.error('Error fetching recurring days:', error);
  }
}


function validTitle(value) {
  return validateLength(value, 3, 20);
}

function validDescription(value) {
  return validateLength(value, 5, 100);
}

function validSubtask(value) {
  return validateLength(value, 3, 20);
}

function validDate() {
  if (task.type === 'one-time') {
    if (new Date(task.startDate) > new Date(task.endDate)) {
      return 'Start date cannot be after end date';
    }

    if (new Date(task.startDate) < new Date()) {
      return 'Start date cannot be in the past';
    }

    if (task.startDate === task.endDate) {
      return 'Start and end dates cannot be the same';
    }
    return '';
  }
}

/**
 * Checks if two time ranges overlap.
 * It creates time range objects for both start and end times,
 * adjusts for day changes, and checks for overlap conditions.
 * @param {string} startA - Start time of the first range.
 * @param {string} endA - End time of the first range.
 * @param {string} startB - Start time of the second range.
 * @param {string} endB - End time of the second range.
 * @returns {boolean} - True if the ranges overlap, false otherwise.
 */
function isTimeRangeOverlap(startA, endA, startB, endB) {


  const startAObj = createTimeRanges(startA, endA);
  const startBObj = createTimeRanges(startB, endB);

  if (startAObj.startTime.getDay() !== startAObj.endTime.getDay()) {
    startBObj.startTime = addOneDay(startBObj.startTime);
    startBObj.endTime = addOneDay(startBObj.endTime);
  }

  console.log('Checking overlap:', startAObj, endA, startBObj, endB);

  return (
      (startAObj.startTime < startBObj.endTime && startAObj.endTime > startBObj.startTime) ||
      (startBObj.startTime < startAObj.endTime && startBObj.endTime > startAObj.startTime)
  );
}

function addOneDay(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

/**
 * Creates time range objects for the given start and end times.
 * It adjusts the end time to the next day if it is less than or equal to the start time.
 * @param {string} startStr - Start time in 'HH:MM' format.
 * @param {string} endStr - End time in 'HH:MM' format.
 * @returns {{startTime: Date, endTime: Date}} - An object containing start and end Date objects.
 */
function createTimeRanges(startStr, endStr) {
  const now = new Date();

  const [startHours, startMinutes] = startStr.split(':').map(Number);
  const [endHours, endMinutes] = endStr.split(':').map(Number);

  const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHours,
      startMinutes,
      0
  );

  let endTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHours,
      endMinutes,
      0
  );

  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return {startTime, endTime};
}

/**
 * Validates recurring days by checking if there are any overlapping time ranges
 * for the same day. It returns an error message if a conflict is found.
 * @returns {string} - An error message if a conflict is found, otherwise an empty string.
 */
function validRecurringDays() {
  if (task.type !== 'recurring') return '';


  for (const time of times) {
    for (const recurringDay of daysTime.days) {
      if (daysTime.endTime === time.startTime || daysTime.startTime === time.endTime) continue

      let days = [];
      days.push(time.day);
      const now = new Date();
      let [hours, minutes] = time.startTime.split(':').map(Number);
      const startTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
      );

      [hours, minutes] = time.endTime.split(':').map(Number);
      const endTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
      );

      if (startTime > endTime) {

        const nextDay = getNextDay(time.day);
        days.push(nextDay);

      }

      const isSameTimeAndDay = days.some(day => recurringDay.includes(day));

      const isTimeRangeOver = isTimeRangeOverlap(
          time.startTime,
          time.endTime,
          daysTime.startTime,
          daysTime.endTime
      );


      if (isSameTimeAndDay && isTimeRangeOver) {
        return 'Task with the same start and end date already exists';
      }
    }
  }

  return '';
}

function getNextDay(dayName) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const index = days.indexOf(dayName);
  return days[(index + 1) % 7];
}


function validCategory(value) {
  return validateLength(value, 4, 10) || task.categories.includes(value) === 'This category already exist';
}

watch(() => task.title, (newValue) => {
  taskError.value.title = validTitle(newValue);
});

watch(() => task.description, (newValue) => {
  taskError.value.description = validDescription(newValue);
});

watch(() => newSubtask.value.trim(), (newValue) => {
  taskError.value.subtask = validSubtask(newValue);
});

watch([() => task.startDate, () => task.endDate],
    () => {
      taskError.value.date = validDate();
    });

watch(
    [() => daysTime.startTime, () => daysTime.endTime, () => daysTime.days.length],
    () => {
      try {
        taskError.value.recurringDay = validRecurringDays();
      } catch (err) {
        console.error('validRecurringDays error:', err);
      }
    },
    {deep: true}
);

watch(() => newCategoryName.value.trim(), (newValue) => {
  taskError.value.category = validCategory(newValue);
});


// Fetches tasks from the server and updates the tasks variable.
async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks');
    tasks.value = response.data;
    console.log('Fetched tasks:', tasks.value);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

async function deleteTask(taskId) {
  try {
    await apiClient.delete(`/tasks/${taskId}`);

    tasks.value = tasks.value.filter(task => task.id !== taskId);
    console.log('Task deleted:', taskId);
    window.location.reload();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

/**
 * Updates the task model with the task data for editing.
 * It finds the task by its ID, opens the modal, and populates the form fields with the task data.
 * @param {string} taskId - The ID of the task to update.
 */
function updateModel(taskId) {
  const taskToUpdate = tasks.value.find(task => task._id === taskId);
  if (taskToUpdate) {
    taskIdForUpdate.value = taskToUpdate._id;
    openModal();
    Object.assign(task, {
      title: taskToUpdate.title,
      description: taskToUpdate.description,
      type: taskToUpdate.type,
      priority: taskToUpdate.priority,
      categories: taskToUpdate.categories.map(cat => cat.name),
      startDate: taskToUpdate.startDate,
      endDate: taskToUpdate.endDate,
      recurringDays: taskToUpdate.recurringDays,
      recurringTime: taskToUpdate.recurringTime,
      subtasks: taskToUpdate.subtasks,
    });
    categories.value = taskToUpdate.categories.map(cat => cat.name);
  }
}

/**
 * Updates the task on the server and in the local tasks array.
 * It checks if the task is completed and sets the completedAt date accordingly.
 * If the task is found in the local tasks array, it updates it and reloads the page.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updatedTask - The updated task data.
 */
async function updateTask(taskId, updatedTask) {
  try {
    if (updatedTask.completed === 'Complete') updatedTask.completedAt = new Date().toISOString();
    else updatedTask.completedAt = null;
    const response = await apiClient.put(`/tasks/${taskId}`, updatedTask);

    const updated = response.data;
    const index = tasks.value.findIndex(task => task.id === updated._id);
    if (index !== -1) {
      tasks.value[index] = updated;
      resetForm();
      window.location.reload();
    }

    window.location.reload();
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

function onSelectedUpdate(taskId, status) {
  changeTaskStatus(taskId, status);
}


/**
 * Checks if the task creation form is disabled based on various validation rules.
 * It checks for errors in the task fields and whether the user is authenticated.
 * @returns {boolean} - True if the form is disabled, false otherwise.
 */
function isDisabledTaskCreate() {
  return (
      taskError.value.title ||
      taskError.value.description ||
      taskError.value.date ||
      taskError.value.recurringDay ||
      taskError.value.category ||
      taskError.value.subtask ||
      !task.title ||
      !task.description ||
      ((!task.startDate ||
          !task.endDate) && task.type === 'one-time') ||
      (task.type === 'recurring' && (!task.recurringDays || task.recurringDays.some(day => !day.startTime || !day.endTime))) &&
      localStorage.getItem('token') === null
      && !isSubmitting.value
  );
}

/**
 * Validates the length of a string value against minimum and maximum limits.
 * If the value is empty, it returns an empty string.
 * If the value is outside the specified range, it returns an error message.
 * @param {string} value - The string value to validate.
 * @param {number} min - The minimum length.
 * @param {number} max - The maximum length.
 * @returns {string} - An error message if validation fails, otherwise an empty string.
 */
function validateLength(value, min, max) {
  if (value.length === 0) {
    return '';
  }
  if (value.length < min || value.length > max) {
    return `Must be between ${min} and ${max} characters`
  }
  return ''
}


/**
 * Checks if a date string is within a specified range of start and end dates.
 * It returns true if the date is within the range, otherwise false.
 * @param {string} dateStr - The date string to check.
 * @param {string} startDateStr - The start date string of the range.
 * @param {string} endDateStr - The end date string of the range.
 * @returns {boolean} - True if the date is in range, false otherwise.
 */
function isDateInRange(dateStr, startDateStr, endDateStr) {
  if (!dateStr || !startDateStr || !endDateStr) return false;

  const date = new Date(dateStr);
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  return date >= start && date <= end;
}


const options = [
  {name: 'In-Progress', value: 'In-progress'},
  {name: 'Complete', value: 'Complete'},
];

const showAddCategory = ref(false);

/**
 * Returns the due date for a task based on its recurring days.
 * It checks today's date and finds the next available day with a start time.
 * If no recurring days are found, it returns 'No due date'.
 * @param {Object} task - The task object containing recurring days.
 * @returns {string} - The due date string or 'No due date'.
 */
function getDueDate(task) {
  const todayIndex = new Date().getDay();

  if (!task.recurringDays || !task.recurringDays.length) {
    return 'No due date';
  }

  const daysMap = task.recurringDays.reduce((acc, item) => {
    acc[item.day] = item;
    return acc;
  }, {});

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const index = (todayIndex + i) % 7;
    const dayName = daysOfWeek[index];

    const dayInfo = daysMap[dayName];
    if (dayInfo && dayInfo.startTime) {
      return `${dayInfo.day}: ${dayInfo.startTime} - ${dayInfo.endTime}`;
    }
  }

  return 'No due date';
}

/**
 * Adds a new category to the categories list.
 * It checks if the category name is valid and not already present in the list.
 * If valid, it adds the new category and resets the input field.
 */
function addNewCategory() {
  if (newCategoryName.value.trim() && !taskError.value.category) {
    console.log('Adding new category:', newCategoryName.value.trim());

    if (categories.value.some(c => c.name === newCategoryName.value.trim())) {
      alert('Category already exists');
      return;
    }

    const newCategory = newCategoryName.value.trim()

    categories.value.push(newCategory);
    newCategoryName.value = '';
    showAddCategory.value = false;
  }
}

watch(showAddCategory, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (document.querySelector('[ref="newCategoryInput"]')) {
        document.querySelector('[ref="newCategoryInput"]').focus();
      }
    });
  }
});

if (localStorage.getItem('token') !== null) {
  fetchRecurringDays();
  fetchTasks();
}
</script>

<template>
  <div class="task-list">
    <div class="row header">
      <h3>Tasks</h3>
      <button @click="openModal" class="button_create"><i class="fas fa-plus"></i> Create</button>
    </div>


    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <form class="modal-content" @submit.prevent="submitTask">
        <div class="header-for-modal">
          <h2>Create Task</h2>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="task-title">Title*</label>
            <input
                id="task-title"
                type="text"
                v-model="task.title"
                required
                placeholder="Enter a task name"
                :class="{'input-error': taskError.title, 'input-valid': !taskError.title && task.title.trim() !== ''}"
            >
            <p class="ErrorText" v-if="taskError.title">{{ taskError.title }}</p>
          </div>

          <div class="form-group">
            <label for="task-description">Description</label>
            <textarea
                id="task-description"
                v-model="task.description"
                placeholder="Add a detailed description..."
                rows="3"
                :class="{'input-error': taskError.description, 'input-valid': !taskError.description && task.description.trim() !== ''}"
            ></textarea>
            <p class="ErrorText" v-if="taskError.description">{{ taskError.description }}</p>
          </div>

          <div class="form-group">
            <label>Task Type*</label>
            <div class="radio-group">
              <label
                  class="radio-label"
                  :class="task.type === 'recurring' ? 'selected' : ''"
              >
                <input
                    type="radio"
                    v-model="task.type"
                    value="recurring"
                    @change="changeTaskType"
                > Constant
              </label>
              <label class="radio-label" :class="task.type === 'one-time' ? 'selected' : ''">
                <input
                    type="radio"
                    v-model="task.type"
                    value="one-time"
                    @change="changeTaskType"
                > Disposable
              </label>
            </div>
          </div>

          <div v-if="task.type === 'recurring'" class="recurring-options">
            <div class="form-group">
              <label>Days of the week*</label>
              <div class="days-checkbox">
                <label v-for="day in daysOfWeek" :key="day.value" class="day-circle">
                  <input
                      type="checkbox"
                      v-model="daysTime.days"
                      :value="day.value"
                  >
                  <p class="ErrorText" v-if="taskError.recurringDays">{{ taskError.recurringDays }}</p>
                  <span class="circle-label">{{ day.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group time-row">
              <label>Start time*</label>
              <input
                  type="time"
                  v-model="daysTime.startTime"
                  :class="{'input-error': taskError.recurringDay, 'input-valid': !taskError.recurringDay && daysTime.startTime !== ''}"
              >
              <label>End time*</label>
              <input
                  type="time"
                  v-model="daysTime.endTime"
                  :class="{'input-error': taskError.recurringDay, 'input-valid': !taskError.recurringDay && daysTime.endTime !== ''}"
              >
            </div>
            <p class="ErrorText" v-if="taskError.recurringDay">{{ taskError.recurringDay }}</p>
            <button
                type="button"
                class="add-category-btn"
                @click="addNewDayTime"
            >Add
            </button>
          </div>

          <div v-if="task.recurringDays && task.recurringDays.length" class="recurring-days-list">
            <h4 class="section-title">Recurring Days</h4>
            <ul class="days-list">
              <li
                  v-for="(day, index) in task.recurringDays"
                  :key="index"
                  class="day-item"
              >
              <span class="day-info">
                    <strong>{{ Array.isArray(day.days) ? day.days.join(', ') : day.days }}</strong> {{
                  day.day
                }} {{ day.startTime }} – {{ day.endTime }}
              </span>
                <button
                    type="button"
                    class="remove-btn"
                    @click="task.recurringDays.splice(index, 1)"
                    title="Remove this day"
                >
                  &times;
                </button>
              </li>
            </ul>
          </div>


          <div v-if="task.type === 'one-time'" class="one-time-options">
            <div class="form-group">
              <label>Start Date*</label>
              <input
                  type="date"
                  v-model="task.startDate"
                  :class="{'input-error': taskError.date, 'input-valid': !taskError.date && task.startDate !== ''}"
                  required
              >
            </div>

            <div class="form-group">
              <label>End Date*</label>
              <input
                  type="date"
                  v-model="task.endDate"
                  :min="task.startDate"
                  :class="{'input-error': taskError.date, 'input-valid': !taskError.date && task.endDate !== ''}"
                  required
              >
              <p class="ErrorText" v-if="taskError.date">{{ taskError.date }}</p>
            </div>
          </div>

          <div class="form-group">
            <label for="task-priority">Priority*</label>
            <select
                id="task-priority"
                v-model="task.priority"
                :class="{'medium': task.priority === 'medium', 'high': task.priority === 'high', 'low': task.priority === 'low'}"
                required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="form-group">
            <label>Category</label>
            <div class="categories-container">
              <div class="categories-scroller">
                <div
                    v-for="category in categories"
                    :key="category"
                    class="category-chip"
                    :class="{ 'active': task.categories.includes(category) }"
                    @click="toggleCategory(category)"
                >
                  {{ category }}
                </div>
                <div class="category-chip add-category" @click="showAddCategory = true">
                  +
                </div>
              </div>
            </div>

            <div v-if="showAddCategory" class="add-category-form">
              <input
                  type="text"
                  v-model="newCategoryName"
                  placeholder="New category name"
                  @keydown.enter="addNewCategory"
                  ref="newCategoryInput"
                  :class="{ 'input-error': taskError.category, 'input-valid': !taskError.category && newCategoryName.trim() !== '' }"
              >
              <button type="button" @click="addNewCategory">Add</button>
              <button type="button" @click="showAddCategory = false">Cancel</button>
            </div>
            <p class="ErrorText" v-if="taskError.category">{{ taskError.category }}</p>
          </div>

          <div class="form-group">
            <label>Subtask</label>
            <div
                class="subtask-input"
            >
              <input
                  type="text"
                  v-model="newSubtask"
                  placeholder="Subtask name"
                  @keydown.enter="addSubtask"
                  :class="{'input-error': taskError.subtask, 'input-valid': taskError.subtask === '' && newSubtask.trim() !== ''}"
              >
              <button type="button" @click="addSubtask" class="add-category-btn">Add</button>
            </div>
            <p class="ErrorText" v-if="taskError.subtask">{{ taskError.subtask }}</p>

            <ul v-if="task.subtasks.length" class="subtasks-list">
              <li v-for="(subtask, index) in task.subtasks" :key="index">
                {{ subtask.title }}
                <button type="button" @click="removeSubtask(index)">×</button>
              </li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="isDisabledTaskCreate()">
            {{ taskIdForUpdate !== null ? 'Update Task' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>

    <div class="task-table">
      <table>
        <thead>
        <tr>
          <th>Topic</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Due Date</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="task in tasks"
            :key="task.id"
            v-if="task"
        >
          <td>
            <router-link
                v-if="task && task._id"
                :to="{ name: 'Task', params: { id: task._id.toString() } }"
                class="task-link"
            >
              {{ task.title }}
            </router-link>
          </td>
          <td>
            <DropMenu
                :options="options"
                :selected="task.type === 'recurring' ? selectedRecurringDayCompleted(task) : task.completed.toString()"
                @update:selected="onSelectedUpdate(task._id, $event)"
            />
          </td>
          <td>
            <img :src="`../assets/${task.priority}-priority.svg`" :alt="task.priority">
          </td>
          <td v-if="task.type === 'one-time'">
            {{
              new Date(task.endDate).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            }}
          </td>
          <td v-else-if="task.type === 'recurring'">
            {{ getDueDate(task) }}
          </td>
          <td>
            <button class="action-button" @click="updateModel(task.id || task._id)"><img
                src="../../public/assets/Pen%20tool.svg"
                alt="Edit"></button>
            <button class="action-button" @click="deleteTask(task.id || task._id)"><img
                src="../../public/assets/delete.svg"
                alt="Delete"></button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.task-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.task-link:hover {
  color: #007bff;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);

  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;

  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;

  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;

  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  min-width: 600px;
  height: 600px;

  -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

  flex-direction: column;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modal-content::-webkit-scrollbar {
  display: none;
}


.modal-content p {
  margin: 1rem 0;
}

.button_create {
  background: #2C2C2C;
  width: 5rem;
  padding: 10px;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-list {
  background: white;
  padding: 15px;
  border: 1px solid #CCCCCC;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.row.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #dddddd;
}

th {
  font-weight: 600;
  color: #555;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}


.header-for-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  background-image: url('../../public/assets/header.jpg');
  box-sizing: border-box;
  padding: 2rem;
  border-radius: 10px 10px 0 0;
}

.header-for-modal h2 {
  font-size: 1.5rem;
  margin: 0;
  color: white;
}

.header-for-modal:last-child {
  align-items: end;
  justify-content: end;
}

.modal-body {
  box-sizing: border-box;
  padding: 2rem;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-right: 16px;
}


.action-button:hover {
  -webkit-transform: scale(1.08);
  transform: scale(1.08);

  -webkit-transition: transform 0.2s ease-in-out;
  transition: transform 0.2s ease-in-out;
}

.action-button:last-child {
  margin-right: 0;
}

td:first-child {
  width: 260px;
}

td:last-child {
  width: 50px;
}

td:nth-child(2) {
  width: 120px;
}

td:nth-child(3) {
  width: 120px;
}

td:nth-child(4) {
  width: 150px;
}


.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.form-group {
  margin-top: 16px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}


.radio-label {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px 8px;
}

.radio-label:hover {
  cursor: pointer;
  border-color: #007bff;
}

.radio-label input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.selected {
  background-color: #4CAF50;
  color: white;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-row label {
  margin: 0;
}

.time-row input {
  flex: 1;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.days-checkbox {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}

.days-checkbox label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.day-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 5px;
  border-radius: 50%;
  background-color: #eee;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative;
}

.day-circle input[type="checkbox"] {
  display: none;
}

.circle-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #eee;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.day-circle input[type="checkbox"]:checked + .circle-label {
  background-color: #007bff;
  color: white;
}

.subtask-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.subtask-input input {
  flex-grow: 1;
}

.subtasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subtasks-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 4px;
}

.subtasks-list li button {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
}

.image-preview {
  margin-top: 8px;
}

.image-preview img {
  max-width: 100%;
  max-height: 150px;
  display: block;
  margin-bottom: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #eee;
  gap: 8px;
}

.input-error {
  border: 1px solid #e74c3c;
  color: #e74c3c;
  box-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
  transition: border-color 0.3s, background-color 0.3s;
  outline: none;
}

.input-valid {
  border: 1px solid #2ecc71;
  color: #2ecc71;
  box-shadow: 0 0 5px rgba(46, 204, 113, 0.5);
  transition: border-color 0.3s, background-color 0.3s;
  outline: none;
}


.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.submit-btn {
  background: #4CAF50;
  color: white;
  border: none;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.category-selector {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category-selector select {
  flex-grow: 1;
}

.category-selector input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-category-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-category-btn:hover {
  background-color: #45a049;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.upload-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #0056b3;
}


.image-preview img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: red;
}

.image-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  width: 200px;
}

.categories-container {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.categories-scroller {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.category-chip {
  flex: 0 0 auto;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #f0f0f0;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.category-chip:hover {
  background-color: #e0e0e0;
}

.category-chip.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.category-chip.add-category {
  background-color: #e0e0e0;
  font-weight: bold;
  min-width: 32px;
  text-align: center;
}

.add-category-form {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

.add-category-form input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-category-form button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-category-form button:first-of-type {
  background-color: #4CAF50;
  color: white;
}

.add-category-form button:last-of-type {
  background-color: #f0f0f0;
}

.recurring-days-list {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.section-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.days-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.day-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.day-info {
  font-size: 0.95rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #d00;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #a00;
}

.ErrorText {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1em;
}

.low {
  border-color: #d4edda;
  color: #155724;
}

.medium {
  border-color: #eecdff;
  color: #6f42c1;
}

.high {
  border-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 480px) {
  .modal-content {
    min-width: 90%;
    height: 90%;
    border-radius: 8px;
    padding: 1rem;
  }

  .header-for-modal {
    height: 80px;
    padding: 1rem;
    text-align: center;
  }

  .header-for-modal h2 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .task-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    font-size: 12px;
    min-width: 600px;
  }

  th, td {
    padding: 8px 10px;
  }

  .row.header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .form-group {
    margin: 12px 0;
  }

  .time-row,
  .radio-group,
  .days-checkbox,
  .category-selector,
  .add-category-form {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }

  .image-preview-wrapper {
    justify-content: flex-start;
  }

  .image-preview {
    width: 100%;
    max-width: 100%;
  }

  .categories-scroller {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .category-chip {
    font-size: 12px;
    padding: 6px 10px;
  }

  .subtask-input {
    flex-direction: column;
  }

  .subtask-input input {
    width: 100%;
  }

  .modal-overlay {
    padding: 10px;
  }

  .recurring-days-list {
    padding: 0.5rem;
  }

  .section-title {
    font-size: 0.9rem;
  }

  .day-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .button_create {
    width: 100%;
    justify-content: center;
  }

  .task-list {
    padding: 10px;
  }

  .status-badge {
    font-size: 0.7rem;
  }

  .action-button {
    font-size: 1rem;
    margin-right: 8px;
  }

  .image-upload {
    gap: 6px;
  }

  .upload-btn {
    font-size: 13px;
    padding: 6px 10px;
  }
}

</style>
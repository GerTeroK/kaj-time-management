<script setup>
import {ref, watch, computed, onMounted, onUnmounted} from 'vue'
import {useRoute} from "vue-router";
import apiClient from "../utils/axiosConfig.js";
import {userStore} from "../utils/userStore.js";
import { useRouter } from 'vue-router'


/**
 * Retrieves the current route and computes the page title.
 * @constant {Ref<string>} pageTitle - Reactive computed property for the page title.
 */
const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Title not found')

let user = ref(null)


const notificationAllowed = ref(false);

onMounted(() => {
  notificationAllowed.value = localStorage.getItem('notification_allowance') === 'true';
});

/**
 * Toggles the notification allowance state and updates local storage.
 * If notifications are allowed, it plays a sound to simulate audio permission.
 * @function toggleNotification
 * @returns {void}
 */
function toggleNotification() {
  notificationAllowed.value = !notificationAllowed.value;
  localStorage.setItem('notification_allowance', JSON.stringify(notificationAllowed.value));
  if (notificationAllowed.value) {
    const audio = new Audio('public/sound/new_message_tone.mp3');
    audio.volume = 0.00;
    audio.play().then(() => {
      localStorage.setItem('audio_allowed', JSON.stringify(true));
      console.log('Audio permission simulated');
    }).catch((err) => {
      console.warn('Audio play failed (user interaction required):', err);
    });
  }
}

/**
 * Logs out the user by clearing the user state and local storage,
 * then redirects to the home page and reloads the window.
 * @function logout
 * @returns {void}
 */
function logout() {
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
  window.location.reload()
}


/**
 * Checks if the token is expired by decoding it and comparing the expiration time.
 * @function isTokenExpired
 * @param {string} token - The JWT token to check.
 * @returns {boolean} - Returns true if the token is expired, false otherwise.
 */
function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const exp = payload.exp;

  return (Date.now() >= exp * 1000);
}

if (localStorage.getItem('user') && !isTokenExpired(localStorage.getItem('token'))) {
  // localStorage.removeItem('token');
  // localStorage.removeItem('user');
  user.value = JSON.parse(localStorage.getItem('user'));
} else {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (user.value) {
    window.location.reload()
  }
  user.value = null;
}

const activeForm = ref('login')
let isFormVisible = ref(false);

const login = ref({
  email: '',
  password: '',
})
const loginErrors = ref({
  email: '',
  password: '',
})



const register = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  avatar: null,
})
const registerErrors = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  avatar: '',
})

/**
 * Validates the length of a string value against minimum and maximum lengths.
 * @function validateLength
 * @param {string} value - The string to validate.
 * @param {number} min - The minimum length.
 * @param {number} max - The maximum length.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validateLength(value, min, max) {
  if (value.length < min || value.length > max) {
    return `Must be between ${min} and ${max} characters`
  }
  return ''
}

/**
 * Validates an email address using a regular expression.
 * @function validateEmail
 * @param {string} value - The email address to validate.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validateEmail(value) {
  if (!value) return 'Email is required'
  if (value.length < 8 || value.length > 35) return 'Email length must be 8-35 chars'
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/iu;
  if (!regex.test(value)) return 'Email is not correct'
  return ''
}

/**
 * Checks if an email exists by making a GET request to the API.
 * @function checkEmailExists
 * @param {string} email - The email address to check.
 * @returns {Promise<boolean|null>} - Returns true if the email exists, false if it does not, or null if an error occurs.
 */
async function checkEmailExists(email) {
  try {
    const response = await apiClient.get(`/users/check/${email}`);


    if (response.status === 404) {
      console.log('Email does not exist.');
      return false;
    } else if (response.ok) {
      console.log('Email exists.');
      return true;
    } else {
      console.error('Error checking email:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

/**
 * Validates a password by checking its length.
 * @function validatePassword
 * @param {string} value - The password to validate.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validatePassword(value) {
  return validateLength(value, 6, 20)
}

/**
 * Validates a username by checking its length.
 * @function validateUsername
 * @param {string} value - The username to validate.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validateUsername(value) {
  return validateLength(value, 3, 20)
}

/**
 * Validates the password confirmation by checking if it matches the original password.
 * @function validatePasswordConfirmation
 * @param {string} password - The original password.
 * @param {string} confirmation - The password confirmation to validate.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validatePasswordConfirmation(password, confirmation) {
  if (confirmation !== password) return 'Passwords do not match'
  return ''
}

/**
 * Validates the avatar file type.
 * @function validateAvatar
 * @param {File} file - The avatar file to validate.
 * @returns {string} - Returns an error message if validation fails, otherwise an empty string.
 */
function validateAvatar(file) {
  if (!file) return ''
  const allowed = ['jpg', 'jpeg', 'png']
  const ext = file.name.split('.').pop().toLowerCase()
  if (!allowed.includes(ext)) return 'Must be .jpg, .jpeg or .png'
  return ''
}

watch(() => login.value.email, (val) => {
  loginErrors.value.email = validateEmail(val)
})
watch(() => login.value.password, (val) => {
  loginErrors.value.password = validatePassword(val)
})

watch(() => register.value.username, (val) => {
  registerErrors.value.username = validateUsername(val)
})
watch(() => register.value.email, (val) => {
  registerErrors.value.email = validateEmail(val)
})
watch(() => register.value.password, (val) => {
  registerErrors.value.password = validatePassword(val)
  registerErrors.value.passwordConfirmation = validatePasswordConfirmation(val, register.value.passwordConfirmation)
})
watch(() => register.value.passwordConfirmation, (val) => {
  registerErrors.value.passwordConfirmation = validatePasswordConfirmation(register.value.password, val)
})
watch(() => register.value.avatar, (val) => {
  registerErrors.value.avatar = validateAvatar(val)
})

/**
 * Handles successful login by setting the user and token in the user store.
 * @function loginSuccess
 * @param {Object} userData - The user data returned from the API.
 * @returns {void}
 */
function loginSuccess(userData) {
  userStore.setUser(userData.user);
  userStore.setToken(userData.token);
}

/**
 * Submits the login form by sending a POST request to the API.
 * If successful, it alerts the user and reloads the page.
 * If an error occurs, it alerts the user about invalid credentials or other errors.
 * @function submitLogin
 * @returns {Promise<void>}
 */
async function submitLogin() {
  const loginData = {
    email: login.value.email,
    password: login.value.password
  };

  try {
    const response = await apiClient.post('http://localhost:3000/users/login', loginData);

    alert('Login successful!');
    loginSuccess(response.data);
    window.location.reload();


  } catch (error) {
    if (error.response?.status === 401) {
      alert('Invalid email or password');
    } else {
      alert('An error occurred during login');
    }
    console.error('Login error:', error);
  }
}




/**
 * Submits the registration form by sending a POST request to the API.
 * If successful, it alerts the user and logs the user data.
 * If an error occurs, it alerts the user about existing email, password mismatch, or other errors.
 * @function submitRegister
 * @returns {Promise<void>}
 */
async function submitRegister() {
  if (user.value !== null) return

  try {
    const response = await apiClient.post('http://localhost:3000/users/register', {
      username: register.value.username,
      email: register.value.email,
      password: register.value.password,
      passwordConfirmation: register.value.passwordConfirmation,
      avatar: register.value.avatar
    });

    if (response.status === 201) {
      alert('Registration successful!');
      console.log('User data:', response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      alert('Email already exists');
    } else if (error.response && error.response.status === 400) {
      alert('Passwords do not match');
    } else {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    }
  }
}


/**
 * Checks if the login and register forms are disabled based on validation errors and empty fields.
 * @constant {Ref<boolean>} isLoginDisabled - Reactive computed property for login button disabled state.
 * @constant {Ref<boolean>} isRegisterDisabled - Reactive computed property for register button disabled state.
 */
const isLoginDisabled = computed(() => {
  return !!loginErrors.value.email || !!loginErrors.value.password || !login.value.email || !login.value.password
})

/** Checks if the register form is disabled based on validation errors and empty fields.
 * @constant {Ref<boolean>} isRegisterDisabled - Reactive computed property for register button disabled state.
 */
const isRegisterDisabled = computed(() => {
  return (
      !!registerErrors.value.username ||
      !!registerErrors.value.email ||
      !!registerErrors.value.password ||
      !!registerErrors.value.passwordConfirmation ||
      !!registerErrors.value.avatar
      || !register.value.username
      || !register.value.email
      || !register.value.password
      || !register.value.passwordConfirmation
      || !register.value.avatar
  )
})


/**
 * Changes the user data by sending a PUT request to the API.
 * If successful, it alerts the user, updates the local storage, and reloads the page.
 * If an error occurs, it alerts the user about the error.
 * @function changeUser
 * @returns {Promise<void>}
 */
function changeUser() {
  if (
      registerErrors.value.username ||
      registerErrors.value.email ||
      registerErrors.value.password ||
      registerErrors.value.passwordConfirmation
  ) {
    alert('Please fix registration errors');
    return;
  }



  apiClient.put(`/users/${user.value.email}`, {
    id: user.value.id,
    username: register.value.username,
    email: register.value.email,
    password: register.value.password,
    passwordConfirmation: register.value.passwordConfirmation
  })
      .then(response => {
        alert('User data changed successfully!');
        user.value = response.data;
        localStorage.setItem('user', JSON.stringify(user.value));
        window.location.reload();
      })
      .catch(error => {
        console.error('Error changing user data:', error);
        alert('An error occurred while changing user data');
      });
}

/**
 * Deletes the user account by sending a DELETE request to the API.
 * If successful, it alerts the user, clears local storage, and reloads the page.
 * If an error occurs, it alerts the user about the error.
 * @function deleteUser
 * @returns {Promise<void>}
 */
function deleteUser() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

  apiClient.delete(`/users/${user.value.email}`)
      .then(() => {
        alert('User deleted successfully!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        user.value = null;
        router.push('/');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
      });
}

const router = useRouter()

function handleFileUpload(event) {
  register.value.avatar = event.target.files[0]
}

function switchToRegister() {
  activeForm.value = 'register'
}
function switchToLogin() {
  activeForm.value = 'login'
}
function toggleFormVisibility() {
  isFormVisible.value = !isFormVisible.value
  if (user) activeForm.value = 'register'
  else activeForm.value = 'login'
}
</script>

<template>
  <header>
    <p class="topic">{{pageTitle}}</p>
    <button class="button_icon" @click="toggleNotification">
      <img v-if="notificationAllowed" src="../../public/assets/notifications.svg" alt="notification" />
      <img v-else src="../../public/assets/notification-stop-svgrepo-com.svg" alt="notification" />
    </button>
    <button v-if="!isFormVisible && !user" class="button_icon" @click="toggleFormVisibility">
      <img src="../../public/assets/Log%20in.svg" alt="Login">
    </button>
    <button v-if="user" @click="toggleFormVisibility" class="button_icon">
      <img src="../../public/assets/Pen%20tool.svg" alt="Edit Profile" />
    </button>
    <button v-if="user" class="button_icon" @click="logout">
      <img src="../../public/assets/Log%20out.svg" alt="Logout">
    </button>
    <router-link v-if="user" to="/profile" class="icon-button username_button">
      <img :src="`http://localhost:3000${user.avatarUrl}`" class="button_icon" alt="">
      <h3 class="button_text">{{ user.username }}</h3>
    </router-link>

  </header>

  <div v-if="isFormVisible" class="auth-container">
    <div :class="['wrapper', { 'active-popup': isFormVisible, active: activeForm === 'register' }]" id="wrapper-id">
      <span class="icone-close" @click="toggleFormVisibility">&times;</span>

      <!-- Login Form -->
      <div class="form-box login" :class="{ active: activeForm === 'login' }">
        <h2>Login</h2>
        <form id="login-form-window" @submit.prevent="submitLogin">
          <div class="input-box">
            <span class="icon">&#9993;</span>
            <input
                v-model="login.email"
                :class="{'valid': !loginErrors.email && login.email.length > 0, 'invalid': loginErrors.email}"
                type="email"
                autocomplete="email"
                placeholder="Email"
                required
            />
            <p class="ErrorText" v-if="loginErrors.email">{{ loginErrors.email }}</p>
          </div>

          <div class="input-box">
            <span class="icon">&#128274;</span>
            <input
                v-model="login.password"
                :class="{'valid': !loginErrors.password && login.password.length > 0, 'invalid': loginErrors.password}"
                type="password"
                autocomplete="current-password"
                placeholder="Password"
                required
            />
            <p class="ErrorText" v-if="loginErrors.password">{{ loginErrors.password }}</p>
          </div>

          <button type="submit" class="btn" id="login-submit-input" :disabled="isLoginDisabled">
            Login
          </button>

          <div class="login-register">
            <p>
              Don't have an account?
              <a href="#" class="register-link" @click.prevent="switchToRegister">Register</a>
            </p>
          </div>
        </form>
      </div>

      <!-- Register Form -->
      <div class="form-box register" :class="{ active: activeForm === 'register' }">
        <h2>{{user ? 'Change data' : 'Registration'}}</h2>
        <form id="register-form-window" @submit.prevent="submitRegister" enctype="multipart/form-data">
          <div class="input-box">
            <span class="icon">&#128101;</span>
            <input
                v-model="register.username"
                :class="{'valid': !registerErrors.username && register.username.length > 0, 'invalid': registerErrors.username}"
                type="text"
                autocomplete="username"
                placeholder="Username"
                required
            />
            <p class="ErrorText" v-if="registerErrors.username">{{ registerErrors.username }}</p>
          </div>

          <div class="input-box">
            <span class="icon">&#9993;</span>
            <input
                v-model="register.email"
                :class="{'valid': !registerErrors.email && register.email.length > 0, 'invalid': registerErrors.email}"
                type="email"
                autocomplete="email"
                placeholder="Email"
                required
            />
            <p class="ErrorText" v-if="registerErrors.email">{{ registerErrors.email }}</p>
          </div>

          <div v-if="!user" class="input-box file-input">
            <label for="register-avatar-input" class="avatar-label">
              <span class="icon">&#128247;</span>
              <span>Choose Avatar</span>
              <input
                  type="file"
                  id="register-avatar-input"
                  accept="image/jpeg,image/png"
                  @change="handleFileUpload"
                  required
              />
            </label>
            <p class="ErrorText" v-if="registerErrors.avatar">{{ registerErrors.avatar }}</p>
          </div>

          <div class="input-box">
            <span class="icon">&#128274;</span>
            <input
                v-model="register.password"
                :class="{'valid': !registerErrors.password && register.password.length > 0, 'invalid': registerErrors.password}"
                type="password"
                autocomplete="new-password"
                placeholder="Password"
                required
            />
            <p class="ErrorText" v-if="registerErrors.password">{{ registerErrors.password }}</p>
          </div>

          <div class="input-box">
            <span class="icon">&#128274;</span>
            <input
                v-model="register.passwordConfirmation"
                :class="{'valid': !registerErrors.passwordConfirmation && register.passwordConfirmation.length > 0, 'invalid': registerErrors.passwordConfirmation}"
                type="password"
                autocomplete="one-time-code"
                placeholder="Confirm Password"
                required
            />
            <p class="ErrorText" v-if="registerErrors.passwordConfirmation">{{ registerErrors.passwordConfirmation }}</p>
          </div>
          
          
          <button v-if="user"
              type="button"
              class="btn"
              @click="changeUser"
                  >
            Change
          </button>

          <button v-if="user" 
              type="button"
              class="btn"
              id="submit-register-input"
                  style="margin-top: 1rem; background: red"
              @click="deleteUser"
                  >
            Delete
          </button>
          
          <button v-if="!user"
              type="submit"
              class="btn"
              id="submit-register-input"
              :disabled="isRegisterDisabled"
          >
            Register
          </button>

          <div v-if="!user" class="login-register">
            <p>
              Already have an account?
              <a href="#" class="login-link" @click.prevent="switchToLogin">Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header Styles */
header * {
  margin: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.logout {
  border: 1px solid #CCCCCC;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  margin-left: 1rem;
  background: #f5f5f5;
}

.logout:hover {
  background: #e0e0e0;
}

.topic {
  color: black;
  text-align: left;
  height: auto;
  width: 100%;
  font-size: 1.8rem;
  font-weight: bold;
  font-family: Inter, sans-serif;
  grid-column: 1 / 2;
}

header {
  text-align: left;
  height: 5.188rem;
  width: calc(100% - 6.563rem);
  border: 1px solid #CCCCCC;
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 1fr auto auto auto auto;
  grid-template-columns: 1fr auto auto auto auto;
  -ms-grid-rows: 1fr;
  grid-template-rows: 1fr;
  gap: 10px;
  justify-items: start;
  position: fixed;
  padding: 1rem;
  top: 0;
  left: 6.563rem;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  box-sizing: border-box;
  background: white !important;
  z-index: 1000;
}

header > * {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button_icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.username_button {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.username_button img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
}

.button_text {
  font-size: 1rem;
  font-weight: normal;
}

/* Auth Form Styles */
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  background-color: transparent;
  z-index: 9998;
}

.wrapper {
  position: fixed;
  left: 34%;
  width: 400px;
  height: 440px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  -webkit-box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  overflow: hidden;
  -webkit-transform: scale(0);
  transform: scale(0);
  -webkit-transition: -webkit-transform 0.5s ease, height 0.2s ease;
  transition: -webkit-transform 0.5s ease, height 0.2s ease;
  transition: transform 0.5s ease, height 0.2s ease, -webkit-transform 0.5s ease;
  z-index: 9999;
}

.wrapper.active-popup {
  -webkit-transform: scale(1);
  transform: scale(1);
}

.wrapper.active {
  height: 620px;
}

.wrapper .form-box {
  width: 100%;
  padding: 40px;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  box-sizing: border-box;
  background: transparent;
  -webkit-transition: -webkit-transform 0.18s ease;
  transition: -webkit-transform 0.18s ease;
  transition: transform 0.18s ease, -webkit-transform 0.18s ease;
}

.wrapper .form-box.login {
  -webkit-transform: translateX(0);
  transform: translateX(0);
  z-index: 2;
}

.wrapper.active .form-box.login {
  -webkit-transition: none;
  transition: none;
  -webkit-transform: translateX(-400px);
  transform: translateX(-400px);
  z-index: 1;
}

.wrapper .form-box.register {
  -webkit-transform: translateX(500px);
  transform: translateX(500px);
  z-index: 1;
}

.wrapper.active .form-box.register {
  -webkit-transition: -webkit-transform 0.18s ease;
  transition: -webkit-transform 0.18s ease;
  transition: transform 0.18s ease, -webkit-transform 0.18s ease;
  -webkit-transform: translateX(0);
  transform: translateX(0);
  margin-top: -20px;
  z-index: 2;
}

.icone-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 45px;
  height: 45px;
  background: #f5f5f5;
  font-size: 2em;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  cursor: pointer;
  z-index: 9999;
  pointer-events: auto;
}

h2 {
  font-size: 2em;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.input-box {
  position: relative;
  width: 100%;
  height: 50px;
  margin: 30px 0;
}

.input-box label {
  position: absolute;
  left: 5px;
  top: 10px;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 1em;
  color: #555555;
  font-weight: 500;
  -webkit-transition: .5s;
  transition: .5s;
}

.input-box input {
  width: 100%;
  height: 100%;
  padding: 0 0 0 8px;
  border: none;
  outline: none;
  border-bottom: 2px solid #ccc;
  font-size: 1em;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  box-sizing: content-box;
}

.input-box input:focus {
  border-bottom-color: #4CAF50;
}

.input-box input.valid {
  border-color: #4CAF50;
}

.input-box input.invalid {
  border-color: #fc3a3a;
}

.input-box .icon {
  position: absolute;
  right: 10px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 1.2em;
  color: #666;
}

.file-input {
  width: 100%;
  height: 20px;
  margin: 20px 0;
}

.avatar-label {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  gap: 10px;
  cursor: pointer;
  color: #666;
}

.avatar-label input[type="file"] {
  display: none;
}

.btn {
  width: 100%;
  height: 45px;
  background: #4CAF50;
  border: none;
  outline: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  font-weight: 600;
  -webkit-transition: background 0.3s;
  transition: background 0.3s;
}

.btn:hover {
  background: #45a049;
}

.login-register {
  font-size: 0.9em;
  text-align: center;
  margin-top: 25px;
}

.login-register a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.login-register a:hover {
  text-decoration: underline;
}

.ErrorText {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1em;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.notice.error {
  color: red;
  text-align: center;
  margin-bottom: 15px;
}


@media (max-width: 480px) {
  .topic {
    font-size: 1rem;
  }

  header {
    grid-template-columns: auto auto auto auto auto;
    gap: 3px;
    padding: 0.5rem;
    font-size: 0.8rem;
    height: 50px;
    width: 100%;
    left: 0;
  }

  .btn {
    font-size: 0.9rem;
    height: 40px;
  }

  .input-box {
    height: 40px;
    width: 80%;
    margin-left: 30px;
  }

  .input-box input {
    font-size: 0.9rem;
    width: 100%;
  }

  .icone-close {
    width: 35px;
    height: 35px;
    font-size: 1.5rem;
  }

  .wrapper {
    width: 95%;
    left: 2.5%;
    height: 900px;
    padding: 0.5rem;
  }

  .wrapper.active {
    height: 600px;
  }

  .wrapper .form-box {
    width: 100%;
    padding: 0.5rem;
  }


  .form-box {
    padding: 1rem;
    height: 900px;
  }
}
</style>
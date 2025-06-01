# Kaj Time Management

## Project Goal

The goal of this project is to create a user-friendly web application for time management with various features to control progress and track productivity.

---

## Project Description and Development Process

The development process consisted of several stages:
1. First, the design was created using Figma.
2. Then, a suitable frontend framework (Vue.js) was selected and the UI was implemented.
3. After that, backend development began.
4. The main functional modules include task management, user profile, reminders, chart export, and timer.

---

## Main Features

- Task management
- User profile management
- Reminder system with offline support and sound notifications
- Exporting charts for productivity analysis
- Timer for tracking time

---

## Running the Project

### Frontend

```bash
cd your_path\kaj-time-management
npm install
npm run dev
```

### Backend

```bash
cd your_path\kaj-time-management\backend
npm install
npm run dev
```

### Database 
To run the project, you need to have MongoDB installed and running. You can use a local MongoDB instance or a cloud service like MongoDB Atlas.
Be sure to create a database with the name `time-management` and set up the connection string in the `.env` file in the backend directory.

## Technologies and Libraries Used

### Frontend
- Vue 3
- Vue Router
- Vuex
- Axios
- Chart.js
- date-fns
- xlsx

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- bcrypt / bcryptjs
- body-parser
- cors
- dotenv
- jsonwebtoken
- multer
- fs

## Additional Information

- The project supports offline reminders with sound notifications.
- Due to the large number of dependencies, it is recommended to run `npm install` in both frontend and backend directories before starting the project.
- Node.js and npm must be installed to run the project.

## Ports
- Frontend: 5173 This is chosen by the node itself.
- Backend: 3000
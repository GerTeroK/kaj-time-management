import { createRouter, createWebHistory } from 'vue-router'
import TasksView from '../views/TasksView.vue'
import DashboardView from "../views/DashboardView.vue";
import TaskView from "../views/TaskView.vue";
import TimerView from "../views/TimerView.vue";
import ReportsView from "../views/ReportsView.vue";
import ProfileView from "../views/ProfileView.vue";

const routes = [
    {
        path: '/tasks',
        name: 'To-Do List',
        component: TasksView,
        meta: { title: 'To-Do List' }
    },
    {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
    },
    {
        path: '/task/:id',
        name: 'Task',
        component: TaskView,
        meta: { title: 'Task' },
        props: true
    },
    {
        path: '/timer',
        name: 'Timer',
        component: TimerView,
        meta: { title: 'Timer' }
    },
    {
      path: '/reports',
        name: 'Reports',
        component: ReportsView,
        meta: { title: 'Reports' }
    },
    {
        path: '/task/:id',
        name: 'Task',
        component: TaskView,
        meta: { title: 'Task' },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: 'Profile' }
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
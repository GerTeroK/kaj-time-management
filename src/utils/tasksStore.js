import {reactive} from "vue";

export const tasksStore = reactive({
    tasks: [],
    setTasks(taskList) {
        this.tasks = taskList;
    },
    addTask(task) {
        this.tasks.push(task);
    },
    clearTasks() {
        this.tasks = [];
    }
});

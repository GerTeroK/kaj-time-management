import apiClient from "./axiosConfig.js";


/**
 * Fetches all tasks from the server.
 * @async
 * @function fetchTasks
 * @returns {Promise<Array>} An array of task objects fetched from the server.
 * @throws {Error} Logs an error if the request fails.
 */
export async function fetchTasks() {
    try {
        const response = await apiClient.get('/tasks');
        console.log('Fetched tasks:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

/**
 * Finds the closest recurring day to today from a list of recurring days.
 * @function findClosestRecurringDay
 * @param {Array} recurringDays - An array of recurring day objects with a `day` property.
 * @returns {Object|null} The closest recurring day object or null if no days are provided.
 */
export function findClosestRecurringDay(recurringDays) {
    const todayIndex = new Date().getDay();

    const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
    };

    if (!recurringDays || recurringDays.length === 0) return null;

    const indexedDays = recurringDays.map(day => ({
        ...day,
        index: dayMap[day.day]
    }));

    indexedDays.sort((a, b) => {
        const diffA = (a.index - todayIndex + 7) % 7;
        const diffB = (b.index - todayIndex + 7) % 7;
        return diffA - diffB;
    });

    return indexedDays[0];
}



/**
 * Converts a time string in the format "HH:mm" to seconds.
 * @function timeStringToSeconds
 * @param {string} timeStr - The time string to convert.
 * @returns {number} The total number of seconds.
 */
export function timeStringToSeconds(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60;
}


/**
 * Calculates the number of seconds between two time strings.
 * @function getSecondsBetween
 * @param {string} startTime - The start time in "HH:mm" format.
 * @param {string} endTime - The end time in "HH:mm" format.
 * @returns {number} The number of seconds between the two times.
 */
export function getSecondsBetween(startTime, endTime) {
    const startSeconds = timeStringToSeconds(startTime);
    const endSeconds = timeStringToSeconds(endTime);

    if (endSeconds < startSeconds) {
        return (24 * 3600 - startSeconds) + endSeconds;
    }

    return endSeconds - startSeconds;
}

/**
 * Changes the status of a task and updates it on the server.
 * @async
 * @function changeTaskStatus
 * @param {string} taskId - The ID of the task to update.
 * @param {string} status - The new status of the task ("Complete", "Pending", or "Failed").
 * @returns {Promise<void>} Updates the task status and reloads the page.
 * @throws {Error} Logs an error if the request fails.
 */
export async function changeTaskStatus(taskId, status) {
    try {

        const response = await apiClient.get(`/tasks/by-id/${taskId}`);
        const taskData = response.data;


        if (!Array.isArray(taskData.recurringDays)) {
            console.warn('recurringDays is not an array or is missing:', taskData.recurringDays);
            return;
        }

        const today = new Date().toLocaleString('en-US', {weekday: 'long'});

        if (taskData.type === 'recurring') {
            let dayEntry = taskData.recurringDays.find(day => day.day === today);

            if (!dayEntry) {
                const closestDay = findClosestRecurringDay(taskData.recurringDays);
                const dayIndex = taskData.recurringDays.findIndex(d => d.day === closestDay.day);

                if (dayIndex !== -1) {
                    dayEntry = taskData.recurringDays[dayIndex];
                } else {
                    console.warn('Closest day not found in recurringDays');
                }
            }

            if (status === 'Complete') {
                const time = taskData.times.reduce((acc, time) => acc + time.time, 0);
                const diffInSeconds = getSecondsBetween(dayEntry.startTime, dayEntry.endTime);
                dayEntry.completedAt = new Date().toISOString();
                if (time > diffInSeconds) {
                    if (time > diffInSeconds + timeStringToSeconds("00:30")) {
                        status = 'Failed'
                    } else {
                        status = 'Pending';
                    }
                }
            }

            if (dayEntry) {
                dayEntry.completed = status;
                console.log('Updated day:', dayEntry);
            } else {
                console.warn(`No recurringDay entry found for "${today}"`);
            }
        } else if (taskData.type === 'one-time') {
            taskData.completed = status;
            if (status === 'Complete') {
                taskData.completedAt = new Date().toISOString();
            } else {
                taskData.completedAt = null;
            }
        }

        const updateResponse = await apiClient.put(`/tasks/${taskId}`, taskData);

        const index = tasks.value.findIndex(t => t._id === taskId);
        if (index !== -1) {
            tasks.value[index] = updateResponse.data;
        }

        window.location.reload();
        console.log('Task status updated successfully');
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}
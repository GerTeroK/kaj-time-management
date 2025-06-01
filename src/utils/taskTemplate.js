export function createOneTimeTask() {
    return {
        id: null,
        title: '',
        description: '',
        type: 'one-time',
        startDate: '',
        endDate: '',
        priority: 'medium',
        categories: [],
        subtasks: [],
        completed: 'In-progress',
    };
}

export function createRecurringTask() {
    return {
        id: null,
        title: '',
        description: '',
        type: 'recurring',
        recurringDays: [],
        priority: 'medium',
        categories: [],
        subtasks: [],
        completed: 'In-progress',
    };
}


export function createTime() {
    return {
        time: 0,
        createdAt: new Date().toISOString(),
    };
}

export function createSubtask() {
    return {
        title: '',
        completed: false,
    };
}
export function createDaysTime() {
    return {
        days: [],
        startTime: '',
        endTime: '',
    };
}
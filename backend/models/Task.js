// models/Task.js
const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: String,
    completed: Boolean
}, { _id: false });

const timeSchema = new mongoose.Schema({
    time: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const daysTimeSchema = new mongoose.Schema({
    title: String,
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    startTime: String,
    endTime: String,
    completed: { type: String, enum: ['In-progress', 'Complete', 'Pending', 'Failed'], default: 'In-progress' },
    completedAt: Date,
}, { _id: false });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
},{ _id: false });

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['one-time', 'recurring'], required: true },
    startDate: String,
    endDate: String,
    recurringDays: [daysTimeSchema],
    times: [timeSchema],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    categories: [categorySchema],
    subtasks: [subtaskSchema],
    completed: { type: String, enum: ['In-progress', 'Complete', 'Pending', 'Failed'], default: 'In-progress' },
    createAt: { type: Date, default: Date.now },
    completedAt: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


module.exports = mongoose.model('Task', taskSchema);

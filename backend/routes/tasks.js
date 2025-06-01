const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const verifyToken = require('../middleware/verifyToken');

router.use(auth);

router.get('/', verifyToken,async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ user: userId });
        console.log('TASKS:', tasks);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to load tasks.' });
    }
});

router.get('/by-id/:id', verifyToken,async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }
        res.json(task);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Failed to load task.' });
    }
})

router.get('/times', verifyToken,async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({user: userId});
        const times = tasks.map(task => task.recurringDays).flat();
        console.log('TIMES:', times);
        res.json(times);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to load tasks.' });
    }
})


router.get('/by-day/:day', verifyToken,async (req, res) => {
    try {
        const day = req.params.day;
        const tasks = await Task.find({
            recurringDays: {
                $elemMatch: {
                    day: day
                }
            }
        });
        console.log('TASKS:', tasks);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to load tasks.' });
    }
});

router.get('/:user', verifyToken, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.params.user });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load tasks.' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('REQ BODY:', req.body);
        const newTask = new Task({
            ...req.body,
            user: req.user.id
        });
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('TASK SAVE ERROR:', err);
        res.status(500).json({ error: 'Failed to create task.' });
    }
});


router.put('/:id', verifyToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ error: 'Task not found' });

        Object.assign(task, req.body);

        await task.save();
        res.json(task);
    } catch (err) {
        console.error('UPDATE ERROR:', err);
        res.status(500).json({ error: 'Failed to update task.' });
    }
});


router.delete('/:id', verifyToken,async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task.' });
    }
});

module.exports = router;

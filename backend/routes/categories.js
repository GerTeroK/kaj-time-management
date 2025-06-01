const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load categories.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        const saved = await newCategory.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save category.' });
    }
});

router.get('/:name', async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.params.name });
        if (category) res.json(category);
        else res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching category.' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User found:', user);
        console.log('Provided password:', password);
        console.log('Stored hashed password:', user.password);
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Generated token:', token);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/change-avatar', upload.single('avatar'), async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.avatarUrl = req.file ? `/uploads/${req.file.filename}` : '';
        await user.save();

        res.status(200).json({
            message: 'Avatar updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (err) {
        console.error('Change avatar error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.post('/register', upload.single('avatar'), async (req, res) => {
    const { username, email, password, passwordConfirmation } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: password,
            avatarUrl: req.file ? `/uploads/${req.file.filename}` : ''
        });


        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load users.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saved = await newUser.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save user.' });
    }
});


router.get('/check/:email', async (req, res) => {
    try {
        const email = req.params.email.trim();

        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:email', async (req, res) => {
    const email = req.params.email;

    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/by-id/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error('Error updating user by ID:', err);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});


router.put('/:email', async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updated = await User.findOneAndUpdate(
            { email: req.params.email },
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

router.delete('/:email', async (req, res) => {
    try {
        await User.findOneAndDelete({email: req.params.email});
        res.status(204).end();
    } catch (err) {
        res.status(500).json({error: 'Failed to delete user.'});
    }
});



module.exports = router;
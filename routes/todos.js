const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');

const router = express.Router();

// Get all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new todo
router.post('/', [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate } = req.body;
    
    const todo = new Todo({
      title,
      description,
      dueDate
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update todo
router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'completed']),
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const todo = await Todo.findOne({ _id: req.params.id });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Update fields
    const updates = ['title', 'description', 'dueDate', 'status', 'completed'];
    const updateData = {};
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        updateData[update] = req.body[update];
      }
    });

    // If completed is set to true, update status as well
    if (req.body.completed === true) {
      updateData.status = 'completed';
    } else if (req.body.completed === false) {
      updateData.status = 'pending';
    }

    await todo.updateOne(updateData);
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updates = {
      completed: !todo.completed,
      status: !todo.completed ? 'completed' : 'pending'
    };
    
    await todo.updateOne(updates);
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
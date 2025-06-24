const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all milestones for a user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new milestone
router.post('/', auth, async (req, res) => {
  try {
    const { title, date, notes } = req.body;
    const user = await User.findById(req.user.id);
    
    user.milestones.push({
      title,
      date,
      notes,
      status: 'pending'
    });

    await user.save();
    res.json(user.milestones[user.milestones.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a milestone
router.put('/:milestoneId', auth, async (req, res) => {
  try {
    const { title, date, notes, status } = req.body;
    const user = await User.findById(req.user.id);
    
    const milestone = user.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.title = title || milestone.title;
    milestone.date = date || milestone.date;
    milestone.notes = notes || milestone.notes;
    milestone.status = status || milestone.status;

    await user.save();
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a milestone
router.delete('/:milestoneId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.milestones.pull(req.params.milestoneId);
    await user.save();
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users' public milestones
router.get('/public', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'username milestones');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 
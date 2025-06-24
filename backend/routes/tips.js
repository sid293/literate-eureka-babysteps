const router = require('express').Router();
const auth = require('../middleware/auth');
const Tip = require('../models/Tip');

// Get tips for a milestone
router.get('/:milestoneId', auth, async (req, res) => {
  try {
    const tips = await Tip.find({ milestone_id: req.params.milestoneId })
      .populate('user', 'username');
    res.json(tips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a tip to a milestone
router.post('/:milestoneId', auth, async (req, res) => {
  try {
    const { tip } = req.body;
    
    const newTip = new Tip({
      milestone_id: req.params.milestoneId,
      user: req.user.id,
      tip
    });

    const savedTip = await newTip.save();
    await savedTip.populate('user', 'username');
    res.json(savedTip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a tip
router.delete('/:tipId', auth, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.tipId);
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    if (tip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this tip' });
    }

    await tip.remove();
    res.json({ message: 'Tip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 
const express = require('express');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');
const moment = require('moment-timezone');

// Get reminders for the logged-in user
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, type, limit = 20, sort = '-scheduledTime' } = req.query;
    const query = { userId: req.user.userId };
    if (status) query.status = status;
    if (type) query.type = type;
    const reminders = await Reminder.find(query)
      .populate('medicationId')
      .sort(sort)
      .limit(Number(limit));
    // Get user's timezone
    const user = await User.findById(req.user.userId);
    const timezone = user?.timezone || 'UTC';
    // Convert scheduledTime to user's timezone for display
    const remindersWithTz = reminders.map(r => {
      const scheduledTimeTz = moment(r.scheduledTime).tz(timezone).format();
      return { ...r.toObject(), scheduledTimeLocal: scheduledTimeTz, timezone };
    });
    res.json(remindersWithTz);
  } catch (err) {
    next(err);
  }
});

// Update reminder status (acknowledge, snooze, miss, with snooze support)
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const { status, snoozeMinutes } = req.body;
    const allowed = ['acknowledged', 'snoozed', 'missed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    let update = { status };
    if (status === 'snoozed') {
      const minutes = Number(snoozeMinutes) || 10;
      update.scheduledTime = new Date(Date.now() + minutes * 60000);
    }
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 
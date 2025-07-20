const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'acknowledged', 'snoozed', 'missed'], default: 'pending' },
  type: { type: String, enum: ['medication', 'renewal'], default: 'medication' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reminder', ReminderSchema); 
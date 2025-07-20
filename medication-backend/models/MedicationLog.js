const mongoose = require('mongoose');

const MedicationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  status: { type: String, enum: ['taken', 'missed', 'skipped'] },
  scheduledTime: Date,
  takenTime: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MedicationLog', MedicationLogSchema); 
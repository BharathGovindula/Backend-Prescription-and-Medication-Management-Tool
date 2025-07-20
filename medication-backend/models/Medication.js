const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  dosage: String,
  frequency: String,
  schedule: {
    type: {
      type: String,
      enum: ['fixed', 'interval', 'custom'],
      default: 'fixed',
    },
    times: [String],
    days: [String],
    startDate: Date,
    endDate: Date,
    intervalHours: Number, // for interval type
    customRules: Object,   // for custom logic
  },
  prescriptionDetails: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    prescriptionImage: String,
    refillsRemaining: Number,
    totalRefills: Number,
  },
  isActive: Boolean,
  interactions: [String], // medication names or codes this med interacts with
  createdAt: { type: Date, default: Date.now },
  renewalRequests: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      requestedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
      message: String,
      response: String,
      respondedAt: Date
    }
  ]
});

module.exports = mongoose.model('Medication', MedicationSchema); 
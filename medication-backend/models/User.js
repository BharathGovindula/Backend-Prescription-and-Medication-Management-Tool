const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: String,
  contact: String,
  specialty: String,
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'doctor', 'admin'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    allergies: [String],
    conditions: [String],
    emergencyContact: Object,
  },
  doctors: [DoctorSchema],
  timezone: { type: String, default: 'UTC' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema); 
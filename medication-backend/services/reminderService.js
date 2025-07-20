const Reminder = require('../models/Reminder');
const Medication = require('../models/Medication');

class ReminderService {
  async checkAndCreateReminders() {
    // Get current time rounded to the minute
    const now = new Date();
    now.setSeconds(0, 0);
    // Find all active medications
    const medications = await Medication.find({ isActive: true });
    for (const med of medications) {
      if (!med.schedule || med.schedule.type !== 'fixed' || !med.schedule.times || !med.schedule.days) continue;
      // Check if today is a scheduled day
      const today = now.toLocaleString('en-US', { weekday: 'long' });
      if (!med.schedule.days.includes(today)) continue;
      // Check if any scheduled time matches the current time
      for (const timeStr of med.schedule.times) {
        const [h, m] = timeStr.split(':').map(Number);
        if (h === now.getHours() && m === now.getMinutes()) {
          // Check if a reminder already exists for this med/user/time
          const exists = await Reminder.findOne({
            userId: med.userId,
            medicationId: med._id,
            scheduledTime: now,
            type: 'medication',
          });
          if (!exists) {
            await Reminder.create({
              userId: med.userId,
              medicationId: med._id,
              scheduledTime: now,
              type: 'medication',
            });
          }
        }
      }
    }
  }
}

module.exports = new ReminderService(); 
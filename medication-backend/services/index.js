const MedicationService = require('./medicationService');
const ReminderService = require('./reminderService');
const AuthService = require('./authService');
const CacheService = require('./cacheService');

const cacheService = new CacheService();
const medicationService = new MedicationService(cacheService);
const reminderService = new ReminderService(medicationService, cacheService);
const authService = new AuthService(cacheService);

module.exports = {
  medicationService,
  reminderService,
  authService,
  cacheService
}; 
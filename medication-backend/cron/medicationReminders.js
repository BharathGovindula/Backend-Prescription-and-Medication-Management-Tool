const cron = require('node-cron');
const reminderService = require('../services/reminderService');

module.exports = () => {
  cron.schedule('* * * * *', async () => {
    await reminderService.checkAndCreateReminders();
  });
}; 
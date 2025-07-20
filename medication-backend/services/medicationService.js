const Medication = require('../models/Medication');

class MedicationService {
  async getAllMedications(userId) {
    return await Medication.find({ userId });
  }

  async createMedication(medicationData, userId) {
    const medication = new Medication({
      ...medicationData,
      userId,
      createdAt: new Date(),
    });
    return await medication.save();
  }

  // Add other methods as needed
}

module.exports = new MedicationService(); 
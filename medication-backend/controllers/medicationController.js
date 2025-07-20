const medicationService = require('../services/medicationService');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');

exports.getAllMedications = async (req, res, next) => {
  try {
    const meds = await medicationService.getAllMedications(req.user.userId);
    res.json(meds);
  } catch (err) {
    next(err);
  }
};

exports.createMedication = async (req, res, next) => {
  try {
    const medication = await medicationService.createMedication(req.body, req.user.userId);
    res.status(201).json(medication);
  } catch (err) {
    next(err);
  }
};

exports.updateMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    res.json(medication);
  } catch (err) {
    next(err);
  }
};

exports.deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    next(err);
  }
};

exports.logMedicationIntake = async (req, res, next) => {
  try {
    const { status, scheduledTime, takenTime, notes } = req.body;
    const medication = await Medication.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    const log = new MedicationLog({
      userId: req.user.userId,
      medicationId: req.params.id,
      status,
      scheduledTime,
      takenTime,
      notes,
      createdAt: new Date(),
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

exports.getMedicationLogs = async (req, res, next) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    const logs = await MedicationLog.find({ medicationId: req.params.id, userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

exports.getScheduleConflicts = async (req, res, next) => {
  try {
    const meds = await Medication.find({ userId: req.user.userId });
    const conflicts = [];
    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const m1 = meds[i];
        const m2 = meds[j];
        const s1 = m1.schedule || {};
        const s2 = m2.schedule || {};
        const days1 = (s1.days || (s1.customRules?.days)) || [];
        const days2 = (s2.days || (s2.customRules?.days)) || [];
        const times1 = (s1.times || (s1.customRules?.times)) || [];
        const times2 = (s2.times || (s2.customRules?.times)) || [];
        for (const day of days1) {
          if (days2.includes(day)) {
            for (const t1 of times1) {
              if (times2.includes(t1)) {
                conflicts.push({
                  med1: { id: m1._id, name: m1.name },
                  med2: { id: m2._id, name: m2.name },
                  time: t1,
                  day,
                });
              }
            }
          }
        }
      }
    }
    res.json(conflicts);
  } catch (err) {
    next(err);
  }
};

exports.getInteractionWarnings = async (req, res, next) => {
  try {
    const meds = await Medication.find({ userId: req.user.userId });
    const warnings = [];
    for (let i = 0; i < meds.length; i++) {
      for (let j = 0; j < meds.length; j++) {
        if (i === j) continue;
        const m1 = meds[i];
        const m2 = meds[j];
        if (m1.interactions && m1.interactions.includes(m2.name)) {
          let severity = 'moderate';
          if (/warfarin|insulin/i.test(m2.name)) severity = 'high';
          warnings.push({
            med1: { id: m1._id, name: m1.name },
            med2: { id: m2._id, name: m2.name },
            severity
          });
        }
      }
    }
    res.json(warnings);
  } catch (err) {
    next(err);
  }
};

exports.requestRenewal = async (req, res, next) => {
  try {
    const { message } = req.body;
    const medication = await Medication.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    const renewalRequest = {
      userId: req.user.userId,
      requestedAt: new Date(),
      status: 'pending',
      message: message || ''
    };
    medication.renewalRequests = medication.renewalRequests || [];
    medication.renewalRequests.push(renewalRequest);
    await medication.save();
    res.status(201).json({ message: 'Renewal request submitted', renewalRequest });
  } catch (err) {
    next(err);
  }
};

exports.getRenewalsForMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    res.json(medication.renewalRequests || []);
  } catch (err) {
    next(err);
  }
};

exports.updateRenewalStatus = async (req, res, next) => {
  try {
    const { status, response } = req.body;
    const medication = await Medication.findOne({ _id: req.params.id });
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    const renewal = medication.renewalRequests.id(req.params.requestId);
    if (!renewal) return res.status(404).json({ message: 'Renewal request not found' });
    if (status) renewal.status = status;
    if (response) renewal.response = response;
    renewal.respondedAt = new Date();
    await medication.save();
    res.json({ message: 'Renewal request updated', renewal });
  } catch (err) {
    next(err);
  }
};

exports.getAllRenewals = async (req, res, next) => {
  try {
    const medications = await Medication.find({ 'renewalRequests.0': { $exists: true } })
      .populate('userId', 'email profile')
      .lean();
    const allRenewals = [];
    for (const med of medications) {
      for (const req of med.renewalRequests) {
        allRenewals.push({
          ...req,
          medication: {
            _id: med._id,
            name: med.name,
            dosage: med.dosage,
            user: med.userId,
          },
        });
      }
    }
    const pending = req.query.status === 'all' ? allRenewals : allRenewals.filter(r => r.status === 'pending');
    res.json(pending);
  } catch (err) {
    next(err);
  }
}; 
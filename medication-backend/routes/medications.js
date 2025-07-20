const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { apiLimiter, userActionLimiter } = require('../middleware/rateLimiter');
const validateSchema = require('../middleware/validateSchema');
const medicationSchema = require('../validation/medicationSchema');
const medicationController = require('../controllers/medicationController');
const router = express.Router();

// Get all medications for the logged-in user
router.get('/', auth, apiLimiter, medicationController.getAllMedications);

// Create a new medication for the logged-in user
router.post('/', auth, userActionLimiter, validateSchema(medicationSchema), medicationController.createMedication);

// Update a medication for the logged-in user
router.put('/:id', auth, userActionLimiter, validateSchema(medicationSchema), medicationController.updateMedication);

// Delete a medication for the logged-in user
router.delete('/:id', auth, userActionLimiter, medicationController.deleteMedication);

// Log medication intake (taken, missed, skipped)
router.post('/:id/log', auth, userActionLimiter, medicationController.logMedicationIntake);

// Get all logs for a medication (for the logged-in user)
router.get('/:id/logs', auth, apiLimiter, medicationController.getMedicationLogs);

// Check for schedule conflicts for the logged-in user
router.get('/conflicts', auth, apiLimiter, medicationController.getScheduleConflicts);

// AI-powered medication interaction warnings
router.get('/interactions', auth, apiLimiter, medicationController.getInteractionWarnings);

// Request prescription renewal for a medication
router.post('/:id/renew', auth, userActionLimiter, medicationController.requestRenewal);

// Get all renewal requests for a medication
router.get('/:id/renewals', auth, apiLimiter, medicationController.getRenewalsForMedication);

// Update a renewal request status (approve/deny)
router.put('/:id/renewals/:requestId', auth, requireRole('doctor', 'admin'), userActionLimiter, medicationController.updateRenewalStatus);

// Get all renewal requests (doctor/admin only)
router.get('/renewals', auth, requireRole('doctor', 'admin'), apiLimiter, medicationController.getAllRenewals);

module.exports = router; 
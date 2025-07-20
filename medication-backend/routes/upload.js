const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Medication = require('../models/Medication');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', auth, upload.single('prescription'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
      if (error) return next(error);
      // Save the Cloudinary URL to the Medication schema (stub: just return URL for now)
      // You can update Medication by ID if needed
      res.json({ url: result.secure_url });
    });
    result.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 
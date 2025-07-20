const Joi = require('joi');

const medicationSchema = Joi.object({
  name: Joi.string().required(),
  dosage: Joi.string().required(),
  frequency: Joi.string().required(),
  schedule: Joi.object({
    type: Joi.string().valid('fixed', 'interval', 'custom').default('fixed'),
    times: Joi.array().items(Joi.string()),
    days: Joi.array().items(Joi.string()),
    startDate: Joi.date(),
    endDate: Joi.date(),
    intervalHours: Joi.number(),
    customRules: Joi.object()
  }).required(),
  isActive: Joi.boolean().default(true)
});

module.exports = medicationSchema; 
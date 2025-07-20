const express = require('express');
const MedicationLog = require('../models/MedicationLog');
const auth = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');
const Medication = require('../models/Medication');

// GET /api/analytics/adherence
// Returns adherence statistics for the logged-in user
router.get('/adherence', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logs = await MedicationLog.find({ userId });
    const total = logs.length;
    const taken = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    res.json({
      total,
      taken,
      missed,
      skipped,
      adherencePercent: adherence
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/trends
// Returns usage/adherence trends grouped by day, week, and month
router.get('/trends', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    // Helper to format date as YYYY-MM-DD
    const formatDate = (d) => d.toISOString().slice(0, 10);
    // Helper to get week string (YYYY-WW)
    const getWeek = (d) => {
      const date = new Date(d);
      const year = date.getFullYear();
      const firstJan = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
      return `${year}-W${week.toString().padStart(2, '0')}`;
    };
    // Helper to get month string (YYYY-MM)
    const getMonth = (d) => d.toISOString().slice(0, 7);

    // Fetch all logs for the user in the last 1 year
    const since = new Date(now);
    since.setFullYear(since.getFullYear() - 1);
    const logs = await MedicationLog.find({ userId, scheduledTime: { $gte: since } });

    // Group by day (last 30 days)
    const dayMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayMap[formatDate(d)] = { date: formatDate(d), taken: 0, missed: 0, skipped: 0, total: 0 };
    }
    logs.forEach(l => {
      if (!l.scheduledTime) return;
      const day = formatDate(l.scheduledTime);
      if (dayMap[day]) {
        dayMap[day].total++;
        if (l.status === 'taken') dayMap[day].taken++;
        if (l.status === 'missed') dayMap[day].missed++;
        if (l.status === 'skipped') dayMap[day].skipped++;
      }
    });
    const daily = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    // Group by week (last 12 weeks)
    const weekMap = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const week = getWeek(d);
      weekMap[week] = { week, taken: 0, missed: 0, skipped: 0, total: 0 };
    }
    logs.forEach(l => {
      if (!l.scheduledTime) return;
      const week = getWeek(l.scheduledTime);
      if (weekMap[week]) {
        weekMap[week].total++;
        if (l.status === 'taken') weekMap[week].taken++;
        if (l.status === 'missed') weekMap[week].missed++;
        if (l.status === 'skipped') weekMap[week].skipped++;
      }
    });
    const weekly = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));

    // Group by month (last 12 months)
    const monthMap = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const month = getMonth(d);
      monthMap[month] = { month, taken: 0, missed: 0, skipped: 0, total: 0 };
    }
    logs.forEach(l => {
      if (!l.scheduledTime) return;
      const month = getMonth(l.scheduledTime);
      if (monthMap[month]) {
        monthMap[month].total++;
        if (l.status === 'taken') monthMap[month].taken++;
        if (l.status === 'missed') monthMap[month].missed++;
        if (l.status === 'skipped') monthMap[month].skipped++;
      }
    });
    const monthly = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({ daily, weekly, monthly });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/ai-adherence
// Returns AI-powered adherence analysis for the logged-in user
router.get('/ai-adherence', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);
    const logs = await MedicationLog.find({ userId, scheduledTime: { $gte: since } });
    const total = logs.length;
    const taken = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    let riskLevel = 'good';
    let reasons = [];
    if (adherence < 80) {
      riskLevel = 'at risk';
      reasons.push('Adherence below 80% in the last 30 days');
    }
    // Analyze missed doses by weekday
    const missedByDay = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const day = l.scheduledTime ? new Date(l.scheduledTime).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown';
      missedByDay[day] = (missedByDay[day] || 0) + 1;
    });
    const maxMissedDay = Object.entries(missedByDay).sort((a, b) => b[1] - a[1])[0];
    if (maxMissedDay && maxMissedDay[1] > 2) {
      reasons.push(`Frequent missed doses on ${maxMissedDay[0]}`);
    }
    // Analyze missed doses by hour
    const missedByHour = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const hour = l.scheduledTime ? new Date(l.scheduledTime).getHours() : null;
      if (hour !== null) missedByHour[hour] = (missedByHour[hour] || 0) + 1;
    });
    const maxMissedHour = Object.entries(missedByHour).sort((a, b) => b[1] - a[1])[0];
    if (maxMissedHour && maxMissedHour[1] > 2) {
      reasons.push(`Frequent missed doses at ${maxMissedHour[0]}:00`);
    }
    // Natural language summary
    let summary = '';
    if (adherence >= 95) {
      summary = `Excellent adherence! You took ${adherence}% of your doses in the last 30 days.`;
    } else if (adherence >= 80) {
      summary = `Good job! Your adherence is ${adherence}%. Keep aiming for 100%.`;
    } else {
      summary = `Your adherence is ${adherence}%. You are at risk of missing important doses.`;
    }
    if (reasons.length > 0) {
      summary += ' Main factors: ' + reasons.join('; ') + '.';
    }
    res.json({
      adherencePercent: adherence,
      total,
      taken,
      missed,
      skipped,
      riskLevel,
      reasons,
      missedByDay,
      missedByHour,
      summary
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/predictive-reminder
// Suggests new reminder times for medications with frequent missed doses
router.get('/predictive-reminder', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);
    // Get all logs for the user in the last 30 days
    const logs = await MedicationLog.find({ userId, scheduledTime: { $gte: since } }).populate('medicationId');
    // Group missed logs by medication and hour
    const missedByMedHour = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const medId = l.medicationId?._id?.toString();
      const hour = l.scheduledTime ? new Date(l.scheduledTime).getHours() : null;
      if (!medId || hour === null) return;
      missedByMedHour[medId] = missedByMedHour[medId] || {};
      missedByMedHour[medId][hour] = (missedByMedHour[medId][hour] || 0) + 1;
    });
    // For each medication, suggest shifting reminders for hours with 3+ misses
    const suggestions = [];
    for (const medId in missedByMedHour) {
      const med = logs.find(l => l.medicationId?._id?.toString() === medId)?.medicationId;
      for (const hour in missedByMedHour[medId]) {
        if (missedByMedHour[medId][hour] >= 3) {
          const newHour = (parseInt(hour) + 1) % 24;
          suggestions.push({
            medication: med ? { id: med._id, name: med.name, dosage: med.dosage } : { id: medId },
            missedHour: hour,
            missedCount: missedByMedHour[medId][hour],
            suggestion: `Consider shifting reminder from ${hour}:00 to ${newHour}:00 for ${med?.name || 'medication'}`
          });
        }
      }
    }
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/suggestions
// Returns actionable, personalized suggestions to improve adherence
router.get('/suggestions', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);
    const logs = await MedicationLog.find({ userId, scheduledTime: { $gte: since } }).populate('medicationId');
    const total = logs.length;
    const taken = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    const suggestions = [];
    // Routine-based suggestions
    const hourMap = {};
    logs.forEach(l => {
      if (l.status === 'taken' && l.scheduledTime) {
        const hour = new Date(l.scheduledTime).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      }
    });
    // Find most common taken hour
    const bestHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
    if (bestHour && bestHour[1] > 2) {
      let routine = '';
      if (bestHour[0] >= 5 && bestHour[0] <= 9) routine = 'after breakfast';
      else if (bestHour[0] >= 12 && bestHour[0] <= 14) routine = 'after lunch';
      else if (bestHour[0] >= 18 && bestHour[0] <= 21) routine = 'after dinner or before bed';
      if (routine) {
        suggestions.push({
          type: 'timing',
          text: `You are most consistent with your medication ${routine}. Try to schedule new medications at this time.`
        });
      }
    }
    if (adherence < 80) {
      suggestions.push({ type: 'general', text: 'Your adherence is below 80%. Try to set reminders at times when you are less likely to be busy.' });
    }
    // Missed doses by day
    const missedByDay = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const day = l.scheduledTime ? new Date(l.scheduledTime).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown';
      missedByDay[day] = (missedByDay[day] || 0) + 1;
    });
    const maxMissedDay = Object.entries(missedByDay).sort((a, b) => b[1] - a[1])[0];
    if (maxMissedDay && maxMissedDay[1] > 2) {
      suggestions.push({ type: 'routine', text: `You often miss doses on ${maxMissedDay[0]}. Try setting extra reminders or alarms on those days.` });
    }
    // Missed doses by hour
    const missedByHour = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const hour = l.scheduledTime ? new Date(l.scheduledTime).getHours() : null;
      if (hour !== null) missedByHour[hour] = (missedByHour[hour] || 0) + 1;
    });
    const maxMissedHour = Object.entries(missedByHour).sort((a, b) => b[1] - a[1])[0];
    if (maxMissedHour && maxMissedHour[1] > 2) {
      suggestions.push({ type: 'timing', text: `You often miss doses at ${maxMissedHour[0]}:00. Try shifting your reminder to a different time.` });
    }
    // Predictive reminder suggestions
    const predictiveRes = await MedicationLog.model('MedicationLog').db.model('MedicationLog').aggregate([
      { $match: { userId: logs[0]?.userId, scheduledTime: { $gte: since }, status: 'missed' } },
      { $group: { _id: { medicationId: '$medicationId', hour: { $hour: '$scheduledTime' } }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
    ]);
    if (predictiveRes.length > 0) {
      suggestions.push({ type: 'timing', text: 'Consider shifting reminders for medications with frequent missed doses to a different time.' });
    }
    // General best practices
    suggestions.push({ type: 'general', text: 'Keep your medications in a visible place as a physical reminder.' });
    suggestions.push({ type: 'general', text: 'Combine medication times with daily routines (e.g., after breakfast).' });
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/smart-schedule
// Suggests optimal times for new medications based on past adherence
router.get('/smart-schedule', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 60); // Use last 60 days for more data
    const logs = await MedicationLog.find({ userId, scheduledTime: { $gte: since } });
    // Count adherence by hour
    const hourStats = {};
    for (let h = 0; h < 24; h++) hourStats[h] = { taken: 0, missed: 0, total: 0 };
    logs.forEach(l => {
      if (!l.scheduledTime) return;
      const hour = new Date(l.scheduledTime).getHours();
      hourStats[hour].total++;
      if (l.status === 'taken') hourStats[hour].taken++;
      if (l.status === 'missed') hourStats[hour].missed++;
    });
    // Calculate adherence percent by hour
    const hourAdherence = Object.entries(hourStats).map(([hour, stat]) => ({
      hour: parseInt(hour),
      adherence: stat.total > 0 ? stat.taken / stat.total : 0,
      missed: stat.missed,
      total: stat.total
    }));
    // Recommend top 3 hours with highest adherence, avoid hours with >2 missed doses
    const recommended = hourAdherence
      .filter(h => h.total > 0 && h.missed <= 2)
      .sort((a, b) => b.adherence - a.adherence)
      .slice(0, 3)
      .map(h => `${h.hour}:00`);
    let explanation = '';
    if (recommended.length > 0) {
      explanation = `Based on your history, you are most likely to take medications successfully at: ${recommended.join(', ')}.`;
    } else {
      explanation = 'No strong adherence patterns found. Try to avoid times with frequent missed doses.';
    }
    res.json({ recommended, explanation });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/streaks-badges
// Returns current streak, longest streak, and earned badges
router.get('/streaks-badges', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logs = await MedicationLog.find({ userId }).sort({ scheduledTime: 1 });
    // Group logs by day
    const dayMap = {};
    logs.forEach(l => {
      if (!l.scheduledTime) return;
      const day = l.scheduledTime.toISOString().slice(0, 10);
      dayMap[day] = dayMap[day] || [];
      dayMap[day].push(l);
    });
    // Calculate streaks
    const days = Object.keys(dayMap).sort();
    let currentStreak = 0, longestStreak = 0, streak = 0;
    let prevDay = null;
    const badges = [];
    days.forEach(day => {
      const allTaken = dayMap[day].every(l => l.status === 'taken');
      if (allTaken) {
        if (prevDay) {
          const prev = new Date(prevDay);
          const curr = new Date(day);
          const diff = (curr - prev) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
          } else {
            streak = 1;
          }
        } else {
          streak = 1;
        }
        if (streak > longestStreak) longestStreak = streak;
        prevDay = day;
      } else {
        streak = 0;
        prevDay = day;
      }
    });
    currentStreak = streak;
    // Badges
    if (longestStreak >= 3) badges.push('3-day Streak');
    if (longestStreak >= 7) badges.push('7-day Streak');
    if (longestStreak >= 30) badges.push('30-day Streak');
    res.json({ currentStreak, longestStreak, badges });
  } catch (err) {
    next(err);
  }
});

// GET /api/logs
// Returns all medication logs for the user, with optional filters
router.get('/logs', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { medicationId, status, startDate, endDate } = req.query;
    const query = { userId };
    if (medicationId) query.medicationId = medicationId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) query.scheduledTime.$gte = new Date(startDate);
      if (endDate) query.scheduledTime.$lte = new Date(endDate);
    }
    const logs = await MedicationLog.find(query)
      .populate('medicationId', 'name dosage')
      .sort({ scheduledTime: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 
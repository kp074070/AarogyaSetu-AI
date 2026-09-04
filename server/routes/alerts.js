import { Router } from 'express';
import Alert from '../models/Alert.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/alerts — List alerts
router.get('/', protect, async (req, res) => {
  try {
    const { severity, type, dismissed = 'false', limit = 50 } = req.query;
    const filter = { dismissed: dismissed === 'true' };

    if (severity && severity !== 'all') filter.severity = severity;
    if (type && type !== 'all') filter.type = type;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    const total = await Alert.countDocuments(filter);
    const criticalCount = await Alert.countDocuments({ dismissed: false, severity: 'critical' });
    const warningCount = await Alert.countDocuments({ dismissed: false, severity: 'warning' });

    res.json({ alerts, total, criticalCount, warningCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts — Create new alert
router.post('/', protect, async (req, res) => {
  try {
    const alert = await Alert.create(req.body);

    const io = req.app.get('io');
    io.emit('newAlert', alert);

    res.status(201).json({ alert });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/dismiss — Dismiss alert
router.patch('/:id/dismiss', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, {
      dismissed: true,
      dismissedBy: req.user._id,
      dismissedAt: new Date(),
    }, { new: true });

    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    const io = req.app.get('io');
    io.emit('alertDismissed', { alertId: alert._id });

    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/appointments — List for current user
router.get('/', protect, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const appointments = await Appointment.find(filter).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/stats — Stats for current user
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const total = await Appointment.countDocuments({ userId });
    const upcoming = await Appointment.countDocuments({ userId, status: 'upcoming' });
    const completed = await Appointment.countDocuments({ userId, status: 'completed' });
    const cancelled = await Appointment.countDocuments({ userId, status: 'cancelled' });

    const nextAppointment = await Appointment.findOne({ userId, status: 'upcoming' }).sort({ date: 1 });

    res.json({ total, upcoming, completed, cancelled, nextAppointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/all — All appointments (hospital admin)
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') return res.status(403).json({ error: 'Hospital access only.' });

    const { phcId, status, limit = 100 } = req.query;
    const filter = {};
    if (phcId) filter.phcId = phcId;
    if (status && status !== 'all') filter.status = status;

    const appointments = await Appointment.find(filter).sort({ date: -1 }).limit(parseInt(limit)).populate('userId', 'fullName email phone');
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments — Book new appointment
router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, userId: req.user._id });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('appointmentUpdate', { type: 'new', appointment });

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/appointments/:id — Update appointment status
router.patch('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    const io = req.app.get('io');
    io.emit('appointmentUpdate', { type: 'update', appointment });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

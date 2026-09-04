import { Router } from 'express';
import PHC from '../models/PHC.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/phcs — List all PHCs with filtering
router.get('/', protect, async (req, res) => {
  try {
    const { state, district, riskLevel, search, sort, limit = 50 } = req.query;
    const filter = {};

    if (state && state !== 'all') filter.state = state;
    if (district && district !== 'all') filter.district = district;
    if (riskLevel && riskLevel !== 'all') filter.riskLevel = riskLevel;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { specializations: { $regex: search, $options: 'i' } },
      ];
    }

    let query = PHC.find(filter).limit(parseInt(limit));

    if (sort === 'rating') query = query.sort({ rating: -1 });
    else if (sort === 'beds') query = query.sort({ availableBeds: -1 });
    else query = query.sort({ riskLevel: 1, rating: -1 });

    const phcs = await query;
    res.json({ phcs, total: await PHC.countDocuments(filter) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/phcs/stats — Dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await PHC.countDocuments();
    const healthy = await PHC.countDocuments({ riskLevel: 'healthy' });
    const warning = await PHC.countDocuments({ riskLevel: 'warning' });
    const critical = await PHC.countDocuments({ riskLevel: 'critical' });
    const totalBeds = await PHC.aggregate([{ $group: { _id: null, total: { $sum: '$beds' }, available: { $sum: '$availableBeds' } } }]);
    const totalDoctors = await PHC.aggregate([{ $group: { _id: null, total: { $sum: '$doctors' } } }]);
    const avgRating = await PHC.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);

    // State-wise distribution
    const stateDistribution = await PHC.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      total, healthy, warning, critical,
      beds: totalBeds[0] || { total: 0, available: 0 },
      doctors: totalDoctors[0]?.total || 0,
      avgRating: avgRating[0]?.avg?.toFixed(1) || '0',
      stateDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/phcs/nearby — PHCs by state for customer
router.get('/nearby', protect, async (req, res) => {
  try {
    const { state, limit = 10 } = req.query;
    const filter = state ? { state } : {};
    const phcs = await PHC.find(filter).sort({ rating: -1 }).limit(parseInt(limit));
    res.json({ phcs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/phcs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const phc = await PHC.findOne({ phcId: req.params.id });
    if (!phc) return res.status(404).json({ error: 'PHC not found.' });
    res.json({ phc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/phcs/:id — Update PHC (bed count, risk level, etc.)
router.patch('/:id', protect, async (req, res) => {
  try {
    const phc = await PHC.findOneAndUpdate({ phcId: req.params.id }, req.body, { new: true, runValidators: true });
    if (!phc) return res.status(404).json({ error: 'PHC not found.' });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('phcUpdate', { phcId: phc.phcId, data: phc });
    if (req.body.availableBeds !== undefined) {
      io.emit('bedUpdate', { phcId: phc.phcId, phcName: phc.name, availableBeds: phc.availableBeds, beds: phc.beds });
    }

    res.json({ phc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

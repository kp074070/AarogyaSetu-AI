import { Router } from 'express';
import Medicine from '../models/Medicine.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/medicines — List with filtering
router.get('/', protect, async (req, res) => {
  try {
    const { phcId, category, status, search, sort, limit = 100 } = req.query;
    const filter = {};

    if (phcId) filter.phcId = phcId;
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Medicine.find(filter).limit(parseInt(limit));
    if (sort === 'stock') query = query.sort({ currentStock: 1 });
    else if (sort === 'name') query = query.sort({ name: 1 });
    else query = query.sort({ status: 1, currentStock: 1 });

    const medicines = await query;
    const total = await Medicine.countDocuments(filter);

    res.json({ medicines, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medicines/stats — Stock summary
router.get('/stats', protect, async (req, res) => {
  try {
    const { phcId } = req.query;
    const filter = phcId ? { phcId } : {};

    const total = await Medicine.countDocuments(filter);
    const adequate = await Medicine.countDocuments({ ...filter, status: 'adequate' });
    const low = await Medicine.countDocuments({ ...filter, status: 'low' });
    const critical = await Medicine.countDocuments({ ...filter, status: 'critical' });
    const outOfStock = await Medicine.countDocuments({ ...filter, status: 'out_of_stock' });

    const categoryBreakdown = await Medicine.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 }, avgStock: { $avg: '$currentStock' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ total, adequate, low, critical, outOfStock, categoryBreakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medicines/availability — Check medicine across PHCs (for customers)
router.get('/availability', protect, async (req, res) => {
  try {
    const { name, state, category, limit = 50 } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (category && category !== 'all') filter.category = category;

    // Get unique medicines
    const medicines = await Medicine.aggregate([
      { $match: filter },
      { $group: {
        _id: '$name',
        category: { $first: '$category' },
        unit: { $first: '$unit' },
        mrp: { $first: '$mrp' },
        manufacturer: { $first: '$manufacturer' },
        availableAt: { $push: { phcId: '$phcId', phcName: '$phcName', currentStock: '$currentStock', status: '$status' } },
        totalStock: { $sum: '$currentStock' },
        phcCount: { $sum: { $cond: [{ $gt: ['$currentStock', 0] }, 1, 0] } },
      }},
      { $sort: { phcCount: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medicines/categories
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    res.json({ categories: categories.sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/medicines/:id — Update stock
router.patch('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ error: 'Medicine not found.' });

    // Recalculate status
    await medicine.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stockUpdate', {
      medicineId: medicine._id,
      name: medicine.name,
      phcId: medicine.phcId,
      phcName: medicine.phcName,
      currentStock: medicine.currentStock,
      status: medicine.status,
    });

    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

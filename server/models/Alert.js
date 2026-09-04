import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['critical_stock', 'outbreak', 'staff_shortage', 'bed_shortage', 'equipment', 'redistribution', 'system'],
    required: true,
    index: true,
  },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info', index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  phcId: { type: String },
  phcName: { type: String },
  state: { type: String },
  district: { type: String },
  relatedEntity: { type: String }, // medicine name, disease, etc.
  dismissed: { type: Boolean, default: false },
  dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dismissedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

alertSchema.index({ dismissed: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);

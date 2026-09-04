import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  // From Kaggle A-Z Medicine Dataset
  name: { type: String, required: true, index: true },
  genericName: { type: String },
  composition: { type: String },
  manufacturer: { type: String },
  category: { type: String, required: true, index: true },
  type: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Powder', 'Inhaler'], default: 'Tablet' },
  mrp: { type: Number, default: 0 },
  unit: { type: String, default: 'Tablets' },
  // Stock per PHC
  phcId: { type: String, required: true, index: true },
  phcName: { type: String },
  currentStock: { type: Number, default: 0 },
  minimumThreshold: { type: Number, default: 50 },
  maximumCapacity: { type: Number, default: 500 },
  lastRestocked: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  batchNumber: { type: String },
  // Computed
  status: { type: String, enum: ['adequate', 'low', 'critical', 'out_of_stock'], default: 'adequate' },
  daysUntilStockout: { type: Number, default: 30 },
  dailyConsumption: { type: Number, default: 5 },
}, { timestamps: true });

medicineSchema.index({ phcId: 1, name: 1 });

// Auto-compute status before save
medicineSchema.pre('save', function (next) {
  const ratio = this.currentStock / this.minimumThreshold;
  if (this.currentStock === 0) this.status = 'out_of_stock';
  else if (ratio < 0.5) this.status = 'critical';
  else if (ratio < 1) this.status = 'low';
  else this.status = 'adequate';

  if (this.dailyConsumption > 0) {
    this.daysUntilStockout = Math.floor(this.currentStock / this.dailyConsumption);
  }
  next();
});

export default mongoose.model('Medicine', medicineSchema);

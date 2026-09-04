import mongoose from 'mongoose';

const phcSchema = new mongoose.Schema({
  phcId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true, index: true },
  district: { type: String, required: true },
  block: { type: String },
  address: { type: String },
  pincode: { type: String },
  // Geo (Kaggle Health Centre Directory)
  latitude: { type: Number },
  longitude: { type: Number },
  // Infrastructure (Kaggle India PHC Data)
  type: { type: String, enum: ['PHC', 'CHC', 'DH', 'Sub-Centre'], default: 'PHC' },
  beds: { type: Number, default: 6 },
  availableBeds: { type: Number, default: 4 },
  buildingCondition: { type: String, enum: ['Good', 'Fair', 'Poor'], default: 'Good' },
  established: { type: Number },
  population: { type: Number, default: 30000 },
  // Staff
  doctors: { type: Number, default: 2 },
  nurses: { type: Number, default: 4 },
  pharmacists: { type: Number, default: 1 },
  labTechnicians: { type: Number, default: 1 },
  totalStaff: { type: Number, default: 10 },
  // Services
  specializations: [String],
  facilities: [String],
  operatingHours: { type: String, default: '8:00 AM - 8:00 PM' },
  ambulanceAvailable: { type: Boolean, default: false },
  telemedicineEnabled: { type: Boolean, default: false },
  ayushUnit: { type: Boolean, default: false },
  // Metrics
  rating: { type: Number, default: 3.5, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy', index: true },
  patientLoad: { type: Number, default: 0 },
  dailyFootfall: { type: Number, default: 50 },
  // Contact
  phone: { type: String },
  email: { type: String },
  lastInspection: { type: Date },
}, { timestamps: true });

phcSchema.index({ state: 1, district: 1 });
phcSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model('PHC', phcSchema);

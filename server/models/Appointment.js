import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  phcId: { type: String, required: true },
  phcName: { type: String },
  state: { type: String },
  district: { type: String },
  department: { type: String, default: 'General Medicine' },
  doctor: {
    name: { type: String, required: true },
    qualification: { type: String, default: 'MBBS' },
  },
  date: { type: Date, required: true, index: true },
  time: { type: String, default: '10:00 AM' },
  tokenNumber: { type: Number },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled', 'no-show'], default: 'upcoming', index: true },
  fee: { type: Number, default: 0 },
  // Diagnosis (filled after appointment)
  diagnosis: {
    condition: String,
    code: String,         // ICD code
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
  },
  prescription: [String],
  notes: { type: String },
  vitals: {
    bp: String,
    pulse: Number,
    temperature: Number,
    weight: Number,
    spo2: Number,
  },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'hospital'], required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  state: { type: String },
  district: { type: String },
  bloodGroup: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  // Hospital-specific
  designation: { type: String },
  hospitalId: { type: String },
  avatar: { type: String },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);

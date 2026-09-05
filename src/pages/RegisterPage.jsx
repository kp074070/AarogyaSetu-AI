import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bloodGroups, indianStates } from '../data/userData';
import {
  Shield, Mail, Lock, Eye, EyeOff, UserPlus, User, Phone,
  Building2, MapPin, CreditCard, Droplets, AlertCircle,
  Heart, Activity, Stethoscope, Pill, ChevronRight, ChevronLeft, Check
} from 'lucide-react';

function RegisterPage() {
  const [step, setStep] = useState(1); // Step 1: basics, Step 2: role-specific
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form data
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Customer fields
    aadhaar: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    dateOfBirth: '',
    gender: 'Male',
    // Hospital fields
    hospitalName: '',
    registrationId: '',
    designation: '',
    state: 'Maharashtra',
    district: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.phone.trim()) return 'Phone number is required';
    return null;
  };

  const validateStep2 = () => {
    if (role === 'hospital') {
      if (!form.hospitalName.trim()) return 'Hospital name is required';
      if (!form.registrationId.trim()) return 'Registration ID is required';
      if (!form.district.trim()) return 'District is required';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setStep(2);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err1 = validateStep1();
    if (err1) { setError(err1); setStep(1); return; }
    const err2 = validateStep2();
    if (err2) { setError(err2); return; }

    setIsLoading(true);

    const userData = { ...form, role };
    // Clean up fields based on role
    if (role === 'customer') {
      delete userData.hospitalName;
      delete userData.registrationId;
      delete userData.designation;
      // Map gender to lowercase for schema
      userData.gender = userData.gender?.toLowerCase();
    } else {
      delete userData.aadhaar;
      delete userData.bloodGroup;
      delete userData.emergencyContact;
      delete userData.dateOfBirth;
      delete userData.gender;
    }
    delete userData.confirmPassword;

    try {
      const user = await register(userData);
      navigate(user.role === 'hospital' ? '/' : '/customer');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg-effects">
        <div className="auth-bg-orb orb-1"></div>
        <div className="auth-bg-orb orb-2"></div>
        <div className="auth-bg-orb orb-3"></div>
        <div className="floating-icons">
          <Heart className="float-icon fi-1" size={20} />
          <Activity className="float-icon fi-2" size={22} />
          <Stethoscope className="float-icon fi-3" size={24} />
          <Pill className="float-icon fi-4" size={18} />
          <Building2 className="float-icon fi-5" size={20} />
          <Shield className="float-icon fi-6" size={22} />
        </div>
      </div>

      <div className="auth-container">
        {/* Left panel - branding */}
        <div className="auth-branding">
          <div className="auth-brand-content">
            <div className="auth-logo">
              <Shield size={32} />
            </div>
            <h1>AarogyaSetu AI</h1>
            <p className="auth-tagline">Join India&apos;s Healthcare Revolution</p>
            <div className="auth-features">
              <div className="auth-feature">
                <Check size={18} />
                <span>Free Health Records Access</span>
              </div>
              <div className="auth-feature">
                <Check size={18} />
                <span>Smart PHC Finder</span>
              </div>
              <div className="auth-feature">
                <Check size={18} />
                <span>Digital Prescriptions</span>
              </div>
              <div className="auth-feature">
                <Check size={18} />
                <span>AI Health Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - register form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Profile Details'}</p>
            </div>

            {/* Step indicator */}
            <div className="auth-steps">
              <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-circle">1</div>
                <span>Basics</span>
              </div>
              <div className="step-line"></div>
              <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <span>Profile</span>
              </div>
            </div>

            {/* Role selector */}
            <div className="auth-role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >
                <User size={20} />
                <div>
                  <strong>Patient</strong>
                  <span>Book appointments, track health</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'hospital' ? 'active' : ''}`}
                onClick={() => setRole('hospital')}
              >
                <Building2 size={20} />
                <div>
                  <strong>Hospital</strong>
                  <span>Manage PHC resources</span>
                </div>
              </button>
            </div>

            {error && (
              <div className="auth-error animate-fade-in">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="auth-step-content animate-fade-in">
                  <div className="auth-field">
                    <label htmlFor="reg-name">Full Name</label>
                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="reg-email">Email Address</label>
                    <div className="auth-input-wrapper">
                      <Mail size={18} className="auth-input-icon" />
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-row">
                    <div className="auth-field">
                      <label htmlFor="reg-password">Password</label>
                      <div className="auth-input-wrapper">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={form.password}
                          onChange={(e) => updateField('password', e.target.value)}
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="reg-confirm">Confirm Password</label>
                      <div className="auth-input-wrapper">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          id="reg-confirm"
                          type="password"
                          placeholder="Re-enter password"
                          value={form.confirmPassword}
                          onChange={(e) => updateField('confirmPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="reg-phone">Phone Number</label>
                    <div className="auth-input-wrapper">
                      <Phone size={18} className="auth-input-icon" />
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="button" className="auth-submit-btn" onClick={handleNext}>
                    Continue
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2: Role-specific */}
              {step === 2 && (
                <div className="auth-step-content animate-fade-in">
                  {role === 'customer' ? (
                    <>
                      <div className="auth-row">
                        <div className="auth-field">
                          <label htmlFor="reg-dob">Date of Birth</label>
                          <div className="auth-input-wrapper">
                            <input
                              id="reg-dob"
                              type="date"
                              value={form.dateOfBirth}
                              onChange={(e) => updateField('dateOfBirth', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="auth-field">
                          <label htmlFor="reg-gender">Gender</label>
                          <div className="auth-input-wrapper">
                            <select
                              id="reg-gender"
                              value={form.gender}
                              onChange={(e) => updateField('gender', e.target.value)}
                              className="auth-select"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="auth-row">
                        <div className="auth-field">
                          <label htmlFor="reg-blood">Blood Group</label>
                          <div className="auth-input-wrapper">
                            <Droplets size={18} className="auth-input-icon" />
                            <select
                              id="reg-blood"
                              value={form.bloodGroup}
                              onChange={(e) => updateField('bloodGroup', e.target.value)}
                              className="auth-select"
                            >
                              {bloodGroups.map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="auth-field">
                          <label htmlFor="reg-aadhaar">Aadhaar (Optional)</label>
                          <div className="auth-input-wrapper">
                            <CreditCard size={18} className="auth-input-icon" />
                            <input
                              id="reg-aadhaar"
                              type="text"
                              placeholder="XXXX-XXXX-XXXX"
                              value={form.aadhaar}
                              onChange={(e) => updateField('aadhaar', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="auth-field">
                        <label htmlFor="reg-emergency">Emergency Contact</label>
                        <div className="auth-input-wrapper">
                          <Phone size={18} className="auth-input-icon" />
                          <input
                            id="reg-emergency"
                            type="tel"
                            placeholder="Emergency contact number"
                            value={form.emergencyContact}
                            onChange={(e) => updateField('emergencyContact', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="auth-field">
                        <label htmlFor="reg-hospital">Hospital / PHC Name</label>
                        <div className="auth-input-wrapper">
                          <Building2 size={18} className="auth-input-icon" />
                          <input
                            id="reg-hospital"
                            type="text"
                            placeholder="e.g. PHC Phaltan"
                            value={form.hospitalName}
                            onChange={(e) => updateField('hospitalName', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="auth-row">
                        <div className="auth-field">
                          <label htmlFor="reg-regid">Registration ID</label>
                          <div className="auth-input-wrapper">
                            <CreditCard size={18} className="auth-input-icon" />
                            <input
                              id="reg-regid"
                              type="text"
                              placeholder="MH-PHC-2024-XXXX"
                              value={form.registrationId}
                              onChange={(e) => updateField('registrationId', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="auth-field">
                          <label htmlFor="reg-designation">Designation</label>
                          <div className="auth-input-wrapper">
                            <Stethoscope size={18} className="auth-input-icon" />
                            <input
                              id="reg-designation"
                              type="text"
                              placeholder="e.g. Medical Officer"
                              value={form.designation}
                              onChange={(e) => updateField('designation', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="auth-row">
                        <div className="auth-field">
                          <label htmlFor="reg-state">State</label>
                          <div className="auth-input-wrapper">
                            <MapPin size={18} className="auth-input-icon" />
                            <select
                              id="reg-state"
                              value={form.state}
                              onChange={(e) => updateField('state', e.target.value)}
                              className="auth-select"
                            >
                              {indianStates.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="auth-field">
                          <label htmlFor="reg-district">District</label>
                          <div className="auth-input-wrapper">
                            <MapPin size={18} className="auth-input-icon" />
                            <input
                              id="reg-district"
                              type="text"
                              placeholder="Enter district"
                              value={form.district}
                              onChange={(e) => updateField('district', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="auth-btn-row">
                    <button type="button" className="auth-back-btn" onClick={() => setStep(1)}>
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="auth-spinner"></span>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

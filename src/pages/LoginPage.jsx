import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Mail, Lock, Eye, EyeOff, LogIn, Heart,
  Activity, Stethoscope, Pill, Building2, UserCircle
} from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 600));

    const result = login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(result.user.role === 'hospital' ? '/' : '/customer');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (role) => {
    if (role === 'customer') {
      setEmail('patient@demo.com');
      setPassword('demo1234');
    } else {
      setEmail('hospital@demo.com');
      setPassword('demo1234');
    }
    setError('');
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
            <p className="auth-tagline">Healthcare Resource Intelligence</p>
            <div className="auth-features">
              <div className="auth-feature">
                <Activity size={18} />
                <span>AI-Powered Health Monitoring</span>
              </div>
              <div className="auth-feature">
                <Building2 size={18} />
                <span>50+ PHCs Across 10 States</span>
              </div>
              <div className="auth-feature">
                <Pill size={18} />
                <span>Real-time Medicine Tracking</span>
              </div>
              <div className="auth-feature">
                <Stethoscope size={18} />
                <span>Smart Appointment Booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - login form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your AarogyaSetu account</p>
            </div>

            {error && (
              <div className="auth-error animate-fade-in">
                <span>⚠</span> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="login-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              <button
                type="submit"
                className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-spinner"></span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="auth-demo-section">
              <div className="auth-divider">
                <span>Quick Demo Login</span>
              </div>
              <div className="auth-demo-buttons">
                <button className="auth-demo-btn customer" onClick={() => fillDemo('customer')}>
                  <UserCircle size={18} />
                  <div>
                    <strong>Patient</strong>
                    <span>patient@demo.com</span>
                  </div>
                </button>
                <button className="auth-demo-btn hospital" onClick={() => fillDemo('hospital')}>
                  <Building2 size={18} />
                  <div>
                    <strong>Hospital Admin</strong>
                    <span>hospital@demo.com</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="auth-footer">
              Don&apos;t have an account?{' '}
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

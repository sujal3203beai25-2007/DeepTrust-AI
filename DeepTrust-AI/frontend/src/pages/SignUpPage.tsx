import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, User as UserIcon, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Forensic Grade'];
  const strengthColors = ['#ff4969', '#ff4969', '#ffb84d', '#33edff', '#17d9aa'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) {
      setError('You must accept the terms of forensic service to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strength < 2) {
      setError('Please choose a stronger password (at least 8 characters with numbers or symbols).');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/login', {
        state: {
          registeredEmail: email.trim(),
          message: 'Account created successfully! Please sign in with your credentials.'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020914] text-[#f3fbff] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00d9f5]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/20 border border-[#00d9f5] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,245,0.4)]">
              <Shield className="w-5 h-5 text-[#00d9f5]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wider text-white">
              DEEP<span className="text-[#00d9f5]">TRUST</span> AI
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Create Forensic Account</h1>
          <p className="text-xs text-[#9bb8c9]">Register to access real AI media detection and forensic verification tools.</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#16425c] shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-center gap-2.5 text-xs text-[#ff4969]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                <input
                  type="email"
                  required
                  placeholder="jane.smith@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9bb8c9] hover:text-[#00d9f5]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#9bb8c9]">Strength:</span>
                    <span style={{ color: strengthColors[strength] }} className="font-bold">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: idx < strength ? strengthColors[strength] : '#16425c',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#16425c] text-[#00d9f5] focus:ring-[#00d9f5] bg-[#061526]"
                />
                <span className="text-[11px] text-[#9bb8c9] leading-tight">
                  I agree to the <span className="text-[#00d9f5]">Terms of Forensic Service</span> and confirm that uploaded media will be handled under strict ethical guidelines.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-semibold text-xs transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#020914] border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="mt-6 pt-4 border-t border-[#16425c]/50 text-center text-xs text-[#9bb8c9]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00d9f5] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

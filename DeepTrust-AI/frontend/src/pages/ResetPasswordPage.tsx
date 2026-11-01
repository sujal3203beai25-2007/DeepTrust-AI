import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Forensic strength meter
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(newPassword);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Forensic Grade'];
  const strengthColors = ['#ff4969', '#ff4969', '#ffb84d', '#33edff', '#17d9aa'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please initiate a new recovery request.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (strength < 2) {
      setError('Please choose a stronger password containing numbers or symbols.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password reset successfully! Please sign in with your new credentials.'
          }
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The authorization link may be expired or already used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020914] text-[#f3fbff] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00d9f5]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/20 border border-[#00d9f5] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,245,0.4)] group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-[#00d9f5]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wider text-white">
              DEEP<span className="text-[#00d9f5]">TRUST</span> AI
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-[#9bb8c9]">Authenticate with a forensic-grade password to restore your account.</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#16425c] shadow-2xl">
          {!token ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-start gap-2.5 text-xs text-[#ff4969]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Missing or Invalid Reset Link</p>
                  <p className="text-[11px] text-[#9bb8c9] mt-1">
                    No authorization token was detected in the URL. Please request a new recovery link.
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="w-full py-2.5 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Request Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : success ? (
            <div className="p-4 rounded-xl bg-[#17d9aa]/10 border border-[#17d9aa]/40 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#17d9aa]/20 border border-[#17d9aa] flex items-center justify-center mx-auto text-[#17d9aa]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-white">Passcode Updated Successfully</h3>
              <p className="text-xs text-[#9bb8c9]">
                Your account password has been updated. Redirecting you to the sign-in terminal...
              </p>
              <div className="w-5 h-5 border-2 border-[#17d9aa] border-t-transparent rounded-full animate-spin mx-auto mt-2" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-start gap-2.5 text-xs text-[#ff4969]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{error}</span>
                    {error.includes('expired') || error.includes('already been used') ? (
                      <div className="mt-2">
                        <Link to="/forgot-password" className="text-[#33edff] underline font-semibold">
                          Request a new reset authorization link →
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  {newPassword && (
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
                    Confirm New Password
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-semibold text-xs transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#020914] border-t-transparent rounded-full animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Passcode</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Bottom link */}
          <div className="mt-6 pt-4 border-t border-[#16425c]/50 text-center text-xs text-[#9bb8c9]">
            Remember your credentials?{' '}
            <Link to="/login" className="text-[#00d9f5] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, KeyRound, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setError('');
    setInfoMessage('');
    setEmail('demo@deeptrust.ai');
    setPassword('DeepTrust#2026');
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
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Sign In to Dashboard</h1>
          <p className="text-xs text-[#9bb8c9]">Authenticate your identity to inspect scans and run neural models.</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#16425c] shadow-2xl">
          {/* Info Banner */}
          {infoMessage && (
            <div className="mb-5 p-3 rounded-xl bg-[#17d9aa]/10 border border-[#17d9aa]/40 flex items-center gap-2.5 text-xs text-[#17d9aa]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#17d9aa]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-center gap-2.5 text-xs text-[#ff4969]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Autofill Banner for Judges */}
          <div className="mb-5 p-3 rounded-xl bg-[#00d9f5]/10 border border-[#00d9f5]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#33edff]">
              <UserCheck className="w-4 h-4 text-[#00d9f5]" />
              <span className="font-mono text-[11px]">Judges & Hackathon Evaluators</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#00d9f5] text-[#020914] font-bold hover:bg-[#33edff] transition-colors cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="demo@deeptrust.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] font-medium">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#00d9f5] hover:text-[#33edff] hover:underline cursor-pointer transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9bb8c9] hover:text-[#00d9f5] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#16425c] text-[#00d9f5] focus:ring-[#00d9f5] bg-[#061526]"
                />
                <span className="text-xs text-[#9bb8c9]">Remember this terminal session</span>
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
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Access Platform</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="mt-6 pt-4 border-t border-[#16425c]/50 text-center text-xs text-[#9bb8c9]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#00d9f5] hover:underline font-semibold">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

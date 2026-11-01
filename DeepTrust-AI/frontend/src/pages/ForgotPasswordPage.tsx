import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft, Sparkles, Terminal } from 'lucide-react';
import { api } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setDevResetUrl(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.dev_reset_url) {
        setDevResetUrl(res.dev_reset_url);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request. Please try again.');
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
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Account Recovery</h1>
          <p className="text-xs text-[#9bb8c9]">Request a single-use authorization token to securely reset your credentials.</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#16425c] shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-center gap-2.5 text-xs text-[#ff4969]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#17d9aa]/10 border border-[#17d9aa]/40 space-y-2 text-xs text-[#17d9aa]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
              <p className="text-[11px] text-[#9bb8c9] pl-6 leading-relaxed">
                If an account matches your email address, you will find instructions and a single-use link with a 15-minute expiration window.
              </p>
            </div>
          )}

          {/* Development Test Email Capture Banner */}
          {devResetUrl && (
            <div className="mb-6 p-4 rounded-xl bg-[#061526] border border-[#00d9f5]/50 shadow-[0_0_20px_rgba(0,217,245,0.2)] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#33edff]">
                  <Terminal className="w-4 h-4 text-[#00d9f5]" />
                  <span className="font-bold">DEV EMAIL CAPTURE</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00d9f5]/20 text-[#00d9f5] border border-[#00d9f5]/30">LOCAL MODE</span>
              </div>
              <p className="text-[11px] text-[#9bb8c9] leading-relaxed">
                External SMTP is currently unconfigured. The single-use reset authorization token was captured below for evaluation:
              </p>
              <div className="p-2.5 rounded-lg bg-[#020914] border border-[#16425c] font-mono text-[11px] text-[#00d9f5] break-all select-all">
                {devResetUrl}
              </div>
              <Link
                to={devResetUrl.includes('/reset-password') ? devResetUrl.substring(devResetUrl.indexOf('/reset-password')) : devResetUrl}
                className="w-full py-2.5 px-3 rounded-lg bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Proceed to Password Reset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9bb8c9] mb-1.5 font-medium">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-semibold text-xs transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#020914] border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Request...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Authorization</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Back Link */}
          <div className="mt-6 pt-4 border-t border-[#16425c]/50 text-center text-xs">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[#9bb8c9] hover:text-[#00d9f5] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

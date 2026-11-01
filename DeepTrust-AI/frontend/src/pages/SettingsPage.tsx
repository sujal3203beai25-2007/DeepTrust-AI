import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Globe,
  Bell,
  Shield,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, language, setLanguage, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Alexander Vance');
  const [email] = useState(user?.email || 'demo@deeptrust.ai');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Notifications toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.updateProfile({
        full_name: fullName,
        preferred_language: language,
        password: newPassword || undefined,
      });
      await refreshUser();
      setSuccessMsg('Profile and preferences updated successfully.');
      setNewPassword('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#16425c]/50">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Account Settings & Security
        </h1>
        <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
          Manage your forensic investigator credentials, language preferences, and security telemetry.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#17d9aa]/15 border border-[#17d9aa]/40 text-xs text-[#17d9aa] flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#ff4969]/15 border border-[#ff4969]/40 text-xs text-[#ff4969] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] space-y-6">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#00d9f5]" />
            <span>Investigator Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#9bb8c9] mb-1.5 font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#9bb8c9] mb-1.5 font-medium">
                Email Address (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={email}
                className="w-full px-4 py-2.5 bg-[#020914] border border-[#16425c] rounded-xl text-xs text-[#9bb8c9]/70 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Multilingual Localization */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00d9f5]" />
            <span>Language & Regional Localization</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English (US / UK)', desc: 'Full forensic suite & reports' },
              { code: 'hi', label: 'हिन्दी (Hindi)', desc: 'इंटरफेस और सुरक्षा सिफारिशें' },
              { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', desc: 'ਇੰਟਰਫੇਸ ਅਤੇ ਸੁਰੱਖਿਆ ਸੇਵਾਵਾਂ' }
            ].map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === l.code
                    ? 'bg-[#00d9f5]/15 border-[#00d9f5] text-white shadow-[0_0_15px_rgba(0,217,245,0.2)]'
                    : 'bg-[#061526] border-[#16425c] text-[#9bb8c9] hover:border-[#00d9f5]/40'
                }`}
              >
                <div className="text-xs font-bold">{l.label}</div>
                <div className="text-[10px] font-mono text-[#9bb8c9] mt-1">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Security & Password */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#00d9f5]" />
            <span>Authentication Security</span>
          </h2>

          <div className="max-w-md">
            <label className="block text-xs font-mono uppercase text-[#9bb8c9] mb-1.5 font-medium">
              Update Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? 'Updating Credentials...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

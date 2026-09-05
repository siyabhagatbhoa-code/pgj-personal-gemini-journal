import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface EditProfileScreenProps {
  onBack: () => void;
}

const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvSDoIbjmrTqPfVCActtUpvCBRmxs2voVF8HVM4A0mMB6RIHTNLt0dSo7FKf7mLzQxNx9pcbsmczK7-7MQzH1WBgTP84OoKyl-ZhzD9MYsK36V83GOIFxgky2Pv3gC7f2C0iJVFzvOJYCQ8GAz2cW9yTEBLnMrzNdjNbDeHkEVka3A2XF8r5u0kPVKWygIcQCLClTkg1VW2aBOf_hYiSApJI8yMiHLVK1ckah3xMwoC3fOAdLa9gk',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { profile, updateSanctuaryProfile } = useAuth();

  const [firstName, setFirstName] = useState(profile?.firstName || 'Elena');
  const [lastName, setLastName] = useState(profile?.lastName || 'Rostova');
  const [moniker, setMoniker] = useState(profile?.moniker || 'Elena');
  const [email, setEmail] = useState(profile?.email || 'elena.rostova@design.studio');
  const [philosophy, setPhilosophy] = useState(
    profile?.philosophy ||
      'Exploring the intersections of architectural design, stillness, and creative cognition. Using PGJ to decompress twilight thoughts.'
  );
  const [pronouns, setPronouns] = useState(profile?.pronouns || 'She / Her');
  const [cadence, setCadence] = useState(
    profile?.cadence || 'PT (7:30 AM Dawn • 9:30 PM Twilight)'
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || PRESET_AVATARS[0]);
  const [pillars, setPillars] = useState<string[]>(
    profile?.pillars || ['Creative Clarity', 'Architecture & Form', 'Mindful Presence']
  );
  const [newPillar, setNewPillar] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()]);
      setNewPillar('');
    }
  };

  const handleRemovePillar = (item: string) => {
    setPillars(pillars.filter((p) => p !== item));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    await updateSanctuaryProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      displayName: fullName || profile?.displayName,
      moniker: moniker.trim() || firstName.trim(),
      email: email.trim(),
      philosophy: philosophy.trim(),
      pronouns: pronouns.trim(),
      cadence: cadence.trim(),
      avatarUrl,
      pillars
    });
    setSaving(false);
    onBack();
  };

  return (
    <div className="w-full pb-16 px-3 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 border border-white/90 shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Sanctuary Settings</span>
      </button>

      {/* Main Form Container */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-10 border border-white/80 shadow-[0_12px_36px_-6px_rgba(107,56,212,0.08),0_1px_2px_rgba(255,255,255,0.95)_inset]">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Edit Sanctuary Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update how your presence, intent, and personal philosophy are attuned to Gemini.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Avatar Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/60 border border-slate-100">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="flex flex-col items-center sm:items-start gap-2">
              <span className="text-xs font-bold text-slate-700">Choose Sanctuary Avatar</span>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                      avatarUrl === url ? 'border-purple-600 ring-2 ring-purple-400/40' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="preset" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="first-name">First Name</label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="last-name">Last Name</label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
          </div>

          {/* Moniker and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="moniker">
                Preferred Moniker (How Gemini addresses you)
              </label>
              <input
                id="moniker"
                type="text"
                value={moniker}
                onChange={(e) => setMoniker(e.target.value)}
                placeholder="Elena"
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="email-addr">Sanctuary Email Address</label>
              <input
                id="email-addr"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
          </div>

          {/* Philosophy / Intent */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700" htmlFor="philosophy-text">
                Personal Intent & Core Philosophy
              </label>
              <span className="text-[11px] text-slate-400">{philosophy.length} characters</span>
            </div>
            <textarea
              id="philosophy-text"
              rows={3}
              value={philosophy}
              onChange={(e) => setPhilosophy(e.target.value)}
              placeholder="Describe your current season of life, core creative goals, or mindfulness posture..."
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm resize-none leading-relaxed"
            />
          </div>

          {/* Pronouns and Cadence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="pronouns-input">Preferred Pronouns</label>
              <input
                id="pronouns-input"
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="She / Her"
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="cadence-input">Twilight Cadence & Timezone</label>
              <input
                id="cadence-input"
                type="text"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
                placeholder="PT (7:30 AM Dawn • 9:30 PM Twilight)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-purple-400 shadow-sm"
              />
            </div>
          </div>

          {/* Sovereign Pillars */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700" htmlFor="new-pillar-input">Sovereign Pillars & Themes</label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {pillars.map((pillar) => (
                <span
                  key={pillar}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold"
                >
                  <span>{pillar}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePillar(pillar)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="new-pillar-input"
                type="text"
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPillar();
                  }
                }}
                placeholder="Add new theme (e.g., Deep Focus)..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Add Pillar
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(107,56,212,0.28)] hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Identity Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

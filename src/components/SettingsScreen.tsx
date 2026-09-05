import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonaId, AuraToneId } from '../types';
import { playMindfulChime } from '../lib/audio';
import { getUserEntries } from '../lib/journalService';

interface SettingsScreenProps {
  onEditProfile: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onEditProfile }) => {
  const { profile, updateSanctuaryProfile, signOutUser, user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const auraTones: { id: AuraToneId; name: string; color: string }[] = [
    { id: 'Dawn Lavender', name: 'Dawn Lavender', color: 'from-purple-200 to-indigo-100' },
    { id: 'Serene Peach', name: 'Serene Peach', color: 'from-orange-100 to-rose-200' },
    { id: 'Aurora Mist', name: 'Aurora Mist', color: 'from-emerald-100 to-sky-200' },
    { id: 'Celestial Sky', name: 'Celestial Sky', color: 'from-sky-200 to-blue-200' }
  ];

  const handleUpdate = async (patch: Parameters<typeof updateSanctuaryProfile>[0]) => {
    setSaving(true);
    await updateSanctuaryProfile(patch);
    setSaving(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 2500);
  };

  const handleExportAll = async () => {
    if (!user) return;
    const entries = await getUserEntries(user.uid);
    const data = {
      sanctuaryUser: profile?.displayName,
      exportedAt: new Date().toISOString(),
      persona: profile?.persona,
      entriesCount: entries.length,
      entries
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PGJ_Sanctuary_Archive_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full pb-16 px-3 sm:px-6 md:px-8 max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-3.5 px-5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Sanctuary alignment updated</span>
        </div>
      )}

      {/* Top Identity Card (Replicating Image 3 Header) */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-8 border border-white/80 shadow-[0_12px_36px_-6px_rgba(107,56,212,0.08),0_1px_2px_rgba(255,255,255,0.95)_inset] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvSDoIbjmrTqPfVCActtUpvCBRmxs2voVF8HVM4A0mMB6RIHTNLt0dSo7FKf7mLzQxNx9pcbsmczK7-7MQzH1WBgTP84OoKyl-ZhzD9MYsK36V83GOIFxgky2Pv3gC7f2C0iJVFzvOJYCQ8GAz2cW9yTEBLnMrzNdjNbDeHkEVka3A2XF8r5u0kPVKWygIcQCLClTkg1VW2aBOf_hYiSApJI8yMiHLVK1ckah3xMwoC3fOAdLa9gk'}
              alt={profile?.displayName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-[0_8px_20px_rgba(107,56,212,0.2)]"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {profile?.displayName || 'Elena Rostova'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>Verified Sanctuary ID</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200/60">
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                <span>Gemini Tuned</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mb-2">
              {profile?.email || 'mindful@presence.inner'} • {profile?.pronouns || 'She / Her'}
            </p>

            <p className="text-xs text-slate-600 line-clamp-2 max-w-xl italic">
              &ldquo;{profile?.philosophy}&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-purple-700 border border-purple-200/80 hover:border-purple-300 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">edit</span>
          <span>Edit Sanctuary Identity</span>
        </button>
      </div>

      {/* Continuity Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">calendar_today</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900">
              {profile?.dayStreak || 18} Days
            </span>
            <span className="text-xs text-slate-500 font-medium">Continuous Journey</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">forum</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900">
              {profile?.reflectionsCount || 54} Reflections
            </span>
            <span className="text-xs text-slate-500 font-medium">Total Contemplations</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">spa</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900">Serene Clarity</span>
            <span className="text-xs text-slate-500 font-medium">Dominant Mindful State</span>
          </div>
        </div>
      </div>

      {/* AI & Reflection Persona Selector */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI & Reflection Persona</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Attune the voice, inquiry style, and presence of Gemini in your journal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 'sage',
              title: 'Mindful Sage',
              desc: 'Socratic, contemplative stillness with poetic inquiries and gentle pacing.',
              icon: 'spa'
            },
            {
              id: 'friend',
              title: 'Empathetic Friend',
              desc: 'Warm, unhurried active listening, non-judgmental embrace, and emotional presence.',
              icon: 'favorite'
            },
            {
              id: 'philosopher',
              title: 'Curious Philosopher',
              desc: 'Epistemological prompts, paradigm shifts, and exploring the roots of meaning.',
              icon: 'lightbulb'
            },
            {
              id: 'coach',
              title: 'Concise Coach',
              desc: 'Structured clarity, behavioral takeaways, somatic check-ins, and actionable clean brevity.',
              icon: 'explore'
            }
          ].map((item) => {
            const isSelected = profile?.persona === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleUpdate({ persona: item.id as PersonaId })}
                className={`p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'bg-purple-50/90 border-purple-400 shadow-sm'
                    : 'bg-white/60 hover:bg-white/90 border-slate-200/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    {isSelected && (
                      <span className="material-symbols-outlined text-purple-600 text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reflection Cadence & Depth */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Reflection Cadence & Depth</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure how deeply Gemini explores each topic and whether ambient chimes sound.
          </p>
        </div>

        {/* Depth Buttons */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">Depth of Reflection</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Brief Clarification', 'Balanced', 'Profound Contemplation'] as const).map(
              (depth) => (
                <button
                  key={depth}
                  onClick={() => handleUpdate({ depth })}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    profile?.depth === depth
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white/70 hover:bg-white text-slate-700 border-slate-200/70'
                  }`}
                >
                  {depth}
                </button>
              )
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-semibold text-slate-800">
                Audio Attunement Chimes (432Hz)
              </span>
              <span className="text-xs text-slate-500 leading-relaxed">
                Play meditative harmonic crystal chimes on reflections
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(profile?.audioChime)}
              aria-label="Toggle audio attunement chimes"
              onClick={() => {
                const next = !profile?.audioChime;
                handleUpdate({ audioChime: next });
                if (next) playMindfulChime(0.25);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 active:scale-95 ${
                profile?.audioChime
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_2px_10px_rgba(107,56,212,0.35)]'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                  profile?.audioChime ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-semibold text-slate-800">
                Proactive Journaling Prompts
              </span>
              <span className="text-xs text-slate-500 leading-relaxed">
                Receive contextual contemplative prompt anchors based on recent themes
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(profile?.proactivePrompts)}
              aria-label="Toggle proactive journaling prompts"
              onClick={() => handleUpdate({ proactivePrompts: !profile?.proactivePrompts })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 active:scale-95 ${
                profile?.proactivePrompts
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_2px_10px_rgba(107,56,212,0.35)]'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                  profile?.proactivePrompts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Aura Tone Palette */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Aura Tone Palette</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Attunes the background pastel gradients and atmospheric lighting.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {auraTones.map((tone) => {
            const isSelected = profile?.auraTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => handleUpdate({ auraTone: tone.id })}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-400/30 bg-purple-50/60 shadow-sm'
                    : 'border-slate-200/70 hover:border-slate-300 bg-white/70'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${tone.color} shadow-sm border border-white`}
                />
                <span className="text-xs font-semibold text-slate-800">{tone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy, Cryptography & Data Ownership */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-600 text-[22px]">shield</span>
          <h3 className="text-lg font-bold text-slate-900">
            Privacy, Cryptography & Sovereign Ownership
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your journal is stored exclusively under your private UID in Cloud Firestore with strictly
          enforced security rules. Requests to Gemini do not persist on external model training
          corpora.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportAll}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Complete Journal (.json)</span>
          </button>

          {showLogoutConfirm ? (
            <div className="flex items-center gap-2 ml-auto p-1.5 px-3 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-800 font-medium">Log out now?</span>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true);
                  await signOutUser();
                }}
                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    <span>Exiting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    <span>Yes, Log Out</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 shadow-sm transition-all flex items-center gap-1.5 ml-auto"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log out of session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

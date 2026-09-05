import React, { useState } from 'react';
import { PersonaId, PersonaConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { playMindfulChime } from '../lib/audio';

const PERSONAS: PersonaConfig[] = [
  {
    id: 'sage',
    name: 'Mindful Sage',
    tagline: 'Recommended for Calm',
    description: 'Socratic, contemplative stillness with poetic inquiries and gentle mindfulness pacing.',
    sampleQuote: 'What space exists beneath this restlessness?',
    badge: 'Recommended for Calm',
    iconName: 'spa',
    badgeColorClass: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'friend',
    name: 'Empathetic Friend',
    tagline: 'High Warmth',
    description: 'Warm, unhurried active listening, non-judgmental embrace, and validating emotional presence.',
    sampleQuote: 'I hear how much care you poured into this.',
    badge: 'High Warmth',
    iconName: 'favorite',
    badgeColorClass: 'bg-pink-100 text-pink-700'
  },
  {
    id: 'philosopher',
    name: 'Curious Philosopher',
    tagline: 'Deep Exploration',
    description: 'Epistemological prompts, paradigm shifts, exploring the roots of meaning and existential wonder.',
    sampleQuote: 'If this constraint dissolved, what emerges?',
    badge: 'Deep Exploration',
    iconName: 'lightbulb',
    badgeColorClass: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 'coach',
    name: 'Concise Coach',
    tagline: 'Action & Clarity',
    description: 'Structured clarity, behavioral takeaways, somatic check-ins, and actionable clean brevity.',
    sampleQuote: 'Three tangible anchors for your morning.',
    badge: 'Action & Clarity',
    iconName: 'explore',
    badgeColorClass: 'bg-sky-100 text-sky-700'
  }
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, profile } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(profile?.persona || 'sage');
  const [audioChime, setAudioChime] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectPersona = (id: PersonaId) => {
    setSelectedPersona(id);
    if (audioChime) {
      playMindfulChime(0.25);
    }
  };

  const handleGetStarted = async () => {
    setSubmitting(true);
    if (audioChime) {
      playMindfulChime(0.4);
    }
    await completeOnboarding(selectedPersona, audioChime);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full pt-20 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Top Progress Indicator Pill */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Step 1 of 2</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 w-20">
            <div className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm" />
            <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-600">Sanctuary Alignment</span>
        </div>

        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Let&apos;s set up your sanctuary
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Select how Gemini attunes to your thoughts, reflections, and contemplative rhythm.
          </p>
        </div>

        {/* Persona Selection Grid (2x2) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPersona(p.id)}
                className={`relative p-6 sm:p-8 rounded-3xl backdrop-blur-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-100/50 via-white/90 to-white/95 border-purple-400 ring-2 ring-purple-500/60 shadow-[0_12px_36px_rgba(107,56,212,0.18)] scale-[1.01]'
                    : 'bg-white/70 hover:bg-white/85 border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg'
                }`}
              >
                {/* Header inside card */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                      isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px]">{p.iconName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.badgeColorClass}`}>
                      {p.badge}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h2>
                  <p className="text-sm text-slate-600 mb-4 min-h-[44px] leading-relaxed">
                    {p.description}
                  </p>

                  {/* Sample Reflection Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-purple-600 text-[15px]">
                        auto_awesome
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                        Sample Reflection
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 italic leading-relaxed">
                      &ldquo;{p.sampleQuote}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Soundwave Frequency Pill */}
        <div className="mb-8 flex items-center justify-center gap-2.5 py-2 px-5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm">
          <span className="material-symbols-outlined text-purple-600 text-[18px] animate-pulse">
            graphic_eq
          </span>
          <span className="text-xs font-medium text-slate-600">
            Attunement Frequency: 432Hz Ambient Resonance Active
          </span>
          <div className="flex items-center gap-1 ml-1">
            <span className="w-1 h-3 rounded-full bg-purple-400 animate-pulse" />
            <span className="w-1 h-5 rounded-full bg-purple-600 animate-pulse" />
            <span className="w-1 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Bottom Floating Card with Chime Switch and CTA */}
        <div className="w-full rounded-3xl bg-white/90 backdrop-blur-2xl p-6 sm:p-8 border border-white shadow-[0_16px_48px_-10px_rgba(107,56,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Audio Attunement Chime */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </div>
            <div className="flex flex-col">
              <label htmlFor="onboarding-chime-toggle" className="text-sm font-bold text-slate-900 cursor-pointer select-none">
                Audio Attunement Chime
              </label>
              <span className="text-xs text-slate-500">
                Include gentle whispering chime during reflections
              </span>
            </div>
            <button
              id="onboarding-chime-toggle"
              type="button"
              role="switch"
              aria-checked={audioChime}
              onClick={() => {
                const next = !audioChime;
                setAudioChime(next);
                if (next) playMindfulChime(0.2);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ml-auto md:ml-4 ${
                audioChime ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out mt-1 ${
                  audioChime ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Right: CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500 text-center sm:text-right hidden xl:inline-block leading-snug">
              You can change your persona anytime
              <br />
              in Sanctuary Settings
            </span>
            <button
              onClick={handleGetStarted}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white text-sm font-semibold shadow-[0_8px_24px_rgba(107,56,212,0.35)] hover:shadow-[0_12px_32px_rgba(107,56,212,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Harmonizing Sanctuary...</span>
              ) : (
                <>
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

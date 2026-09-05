import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AmbientBackground } from './AmbientBackground';
import { GeminiLogo } from './GeminiLogo';

interface LandingScreenProps {
  onGetStarted: () => void;
  onLogIn: () => void;
  onContinueToSanctuary: () => void;
  onTryProtectedFeature: (screen: 'chat' | 'past-entries' | 'settings') => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted,
  onLogIn,
  onContinueToSanctuary,
  onTryProtectedFeature
}) => {
  const { user, profile } = useAuth();
  const [activeTopicIndex, setActiveTopicIndex] = React.useState<number>(0);

  const heroTopics = [
    {
      label: '✨ Unpack stress',
      tag: 'Mindful Decompression',
      mood: 'Calm',
      userMsg: "I've been feeling overwhelmed by conflicting deadlines and can't seem to unwind.",
      aiMsg: "When everything feels urgent, our nervous system stays on high alert. Take a slow breath. Which single task, if paused until tomorrow, would give you the most breathing room right now?",
      persona: 'Mindful Sage',
      personaIcon: 'spa',
      personaColor: 'from-purple-500 to-indigo-500'
    },
    {
      label: '🌱 Tough decision',
      tag: 'Perspective Shift',
      mood: 'Reflective',
      userMsg: "I'm torn between staying in my comfortable routine or taking an exciting new risk.",
      aiMsg: "Comfort protects our present, while growth asks us to embrace uncertainty. If you stepped into that risk with full trust in your resilience, what would excite you most about it?",
      persona: 'Empathetic Friend',
      personaIcon: 'favorite',
      personaColor: 'from-pink-500 to-rose-500'
    },
    {
      label: '🎯 Morning focus',
      tag: 'Priority Alignment',
      mood: 'Energized',
      userMsg: "I have 10 different ideas today and want to channel my energy without burning out.",
      aiMsg: "Let's find your singular anchor. What is the one impactful milestone that would make today a win, even if the other nine wait for tomorrow?",
      persona: 'Concise Coach',
      personaIcon: 'explore',
      personaColor: 'from-sky-500 to-blue-600'
    },
    {
      label: '💡 Creative spark',
      tag: 'Inquiry & Curiosity',
      mood: 'Inspired',
      userMsg: "I'm looking for a fresh perspective on a project that feels repetitive.",
      aiMsg: "Repetition often conceals an unasked question. If you removed the standard rules of this medium entirely, what playful experiment would you try?",
      persona: 'Curious Philosopher',
      personaIcon: 'lightbulb',
      personaColor: 'from-amber-500 to-indigo-600'
    }
  ];

  const currentTopic = heroTopics[activeTopicIndex];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col selection:bg-purple-200 selection:text-purple-900">
      {/* 3D Glassmorphism Atmospheric Floating Gradient Orbs */}
      <AmbientBackground auraTone={profile?.auraTone || 'Dawn Lavender'} />

      {/* Floating Glass Navigation Header with clear gap to body */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 md:px-10 pt-4 pb-2 mb-4 sm:mb-6">
        <div className="max-w-6xl mx-auto h-16 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_10px_35px_-5px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.9)_inset] px-4 sm:px-6 flex items-center justify-between transition-all">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-200/90 via-pink-50 to-sky-100 p-0.5 border border-white/90 shadow-[0_4px_16px_rgba(107,56,212,0.15),0_1px_2px_rgba(255,255,255,0.9)_inset] flex items-center justify-center">
              <GeminiLogo size={24} />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">PGJ</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-purple-100/80 text-[10px] font-bold text-purple-700">
                  Gemini
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden xs:inline">
                Personal Gemini Journal
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-purple-700 transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('personas')}
              className="hover:text-purple-700 transition-colors"
            >
              Companion Personas
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('privacy')}
              className="hover:text-purple-700 transition-colors"
            >
              Privacy & Security
            </button>
          </nav>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={onContinueToSanctuary}
                  title="Open your personal journal and start chatting with Gemini"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-[0_4px_14px_rgba(107,56,212,0.22)] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Open Journal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTryProtectedFeature('settings')}
                  title="View your account and profile settings"
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  <img
                    src={
                      profile?.avatarUrl ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvSDoIbjmrTqPfVCActtUpvCBRmxs2voVF8HVM4A0mMB6RIHTNLt0dSo7FKf7mLzQxNx9pcbsmczK7-7MQzH1WBgTP84OoKyl-ZhzD9MYsK36V83GOIFxgky2Pv3gC7f2C0iJVFzvOJYCQ8GAz2cW9yTEBLnMrzNdjNbDeHkEVka3A2XF8r5u0kPVKWygIcQCLClTkg1VW2aBOf_hYiSApJI8yMiHLVK1ckah3xMwoC3fOAdLa9gk'
                    }
                    alt={profile?.displayName || 'User Profile'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onLogIn}
                  title="Log into your existing account"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={onGetStarted}
                  title="Create a new free account to start chatting"
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-[0_4px_16px_rgba(107,56,212,0.25)] transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>Sign Up Free</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Redesigned Hero Section: Dynamic Asymmetric Split Layout */}
      <section className="w-full pt-6 sm:pt-10 md:pt-14 pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column (7 cols): Captivating Messaging, Dynamic Topic Starters, and Glowing CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Live Powered Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-purple-200/80 shadow-[0_4px_16px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.9)_inset] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <GeminiLogo size={16} />
              <span className="text-xs font-bold text-slate-800 tracking-wide">
                Personal Gemini Journal <span className="text-purple-600 font-semibold">• 100% Private</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.14] mb-5">
              Where your thoughts find{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent underline decoration-purple-300 decoration-wavy decoration-2">
                clarity
              </span>{' '}
              and stillness.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-xl font-normal">
              Speak out loud with voice typing or write down your private thoughts. PGJ pairs the comfort of personal journaling with Gemini's empathetic intelligence—always sandboxed, with zero advertisements.
            </p>

            {/* Interactive Prompt / Mood Starters */}
            <div className="w-full mb-7">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-2.5">
                Try a prompt preview:
              </span>
              <div className="flex flex-wrap gap-2">
                {heroTopics.map((topic, idx) => {
                  const isActive = activeTopicIndex === idx;
                  return (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => setActiveTopicIndex(idx)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(107,56,212,0.3)] scale-[1.02]'
                          : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 hover:border-purple-300 shadow-sm'
                      }`}
                    >
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Glowing Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-8 w-full sm:w-auto">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={onContinueToSanctuary}
                    title="Open your personal journal and start chatting with Gemini"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-[0_10px_25px_rgba(107,56,212,0.35),0_1px_2px_rgba(255,255,255,0.4)_inset] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Open Journal</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTryProtectedFeature('past-entries')}
                    title="View your saved conversations"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/85 hover:bg-white text-slate-700 text-sm font-semibold border border-white shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_2px_rgba(255,255,255,0.95)_inset] backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer min-h-[48px]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-purple-600">
                      history_edu
                    </span>
                    <span>Saved Chats</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    title="Create your account to start your private journal"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-[0_10px_25px_rgba(107,56,212,0.35),0_1px_2px_rgba(255,255,255,0.4)_inset] transition-all flex items-center justify-center gap-2 active:scale-95 group cursor-pointer min-h-[48px]"
                  >
                    <span>Get Started Free</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogIn}
                    title="Sign into your existing account"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/85 hover:bg-white text-slate-700 text-sm font-semibold border border-white shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_2px_rgba(255,255,255,0.95)_inset] backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer min-h-[48px]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-purple-600">login</span>
                    <span>Log In</span>
                  </button>
                </>
              )}
            </div>

            {/* Quick Trust Highlights with Glass Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  lock
                </span>
                <span>User-Isolated Firestore</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-purple-600">
                  psychology
                </span>
                <span>Sub-Second Gemini AI</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-sky-600">
                  mic
                </span>
                <span>Live Voice Typing</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Glass Interactive Dialogue Showcase Preview */}
          <div className="lg:col-span-5 relative w-full">
            {/* Background ambient glow behind card */}
            <div className="absolute -top-6 -right-6 w-56 h-56 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-56 h-56 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />

            {/* Top Floating Glass Badge */}
            <div className="absolute -top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xl border border-purple-200/80 shadow-[0_6px_20px_rgba(107,56,212,0.15)] text-[10px] font-bold text-purple-700 animate-pulse">
              <span className="material-symbols-outlined text-[14px] text-purple-600">lock</span>
              <span>Encrypted Session</span>
            </div>

            {/* 3D Glass Showcase Card */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_-12px_rgba(107,56,212,0.18),0_1px_3px_rgba(255,255,255,0.95)_inset] p-5 sm:p-6 text-left relative overflow-hidden flex flex-col gap-4">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-slate-500 ml-1.5">
                    {currentTopic.tag}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/80 text-purple-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    <span>{currentTopic.persona}</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Conversation Bubble Preview */}
              <div className="space-y-3.5 min-h-[220px] flex flex-col justify-center">
                {/* User Message */}
                <div className="flex flex-col items-end max-w-[92%] ml-auto animate-fadeIn">
                  <span className="text-[10px] font-semibold text-slate-400 mr-2 mb-1 flex items-center gap-1">
                    <span>You</span>
                    <span className="text-[9px] px-1.5 rounded-full bg-purple-100 text-purple-600 font-bold">
                      {currentTopic.mood}
                    </span>
                  </span>
                  <div className="p-3.5 rounded-2xl rounded-br-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm leading-relaxed shadow-[0_4px_16px_rgba(107,56,212,0.22)]">
                    {currentTopic.userMsg}
                  </div>
                </div>

                {/* AI Persona Response */}
                <div className="flex flex-col items-start max-w-[95%] mr-auto animate-fadeIn">
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-purple-700 font-semibold">
                    <span className="material-symbols-outlined text-[15px]">
                      {currentTopic.personaIcon}
                    </span>
                    <span>Gemini AI • {currentTopic.persona}</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl rounded-bl-sm bg-white/95 border border-purple-100/90 text-slate-800 text-xs sm:text-sm shadow-[0_4px_20px_rgba(107,56,212,0.06)] leading-relaxed">
                    {currentTopic.aiMsg}
                  </div>
                </div>
              </div>

              {/* Interactive Mock Input Bar with CTA */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={user ? onContinueToSanctuary : onGetStarted}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-700 text-xs text-left border border-slate-200/80 hover:border-purple-200 transition-colors flex items-center justify-between cursor-pointer min-h-[44px]"
                  title="Click to start typing your reflection"
                >
                  <span className="truncate">Type or speak your thoughts...</span>
                  <span className="material-symbols-outlined text-[18px] text-purple-600 shrink-0 ml-2">
                    mic
                  </span>
                </button>

                <button
                  type="button"
                  onClick={user ? onContinueToSanctuary : onGetStarted}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer min-h-[44px]"
                >
                  <span>Chat</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Glass Cards Section */}
      <section id="features" className="w-full py-16 px-4 sm:px-6 md:px-10 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold tracking-wider uppercase mb-3">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>App Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Built for peace of mind and complete privacy
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every feature is designed to be simple, helpful, and safe for your everyday thoughts.
            </p>
          </div>

          {/* 4 Feature Glass Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 1. Private & Encrypted */}
            <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-7 sm:p-8 border border-white/80 shadow-[0_15px_45px_-10px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.95)_inset] hover:shadow-[0_20px_55px_-8px_rgba(107,56,212,0.16)] transition-all flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 border border-white/90 shadow-[0_6px_20px_rgba(107,56,212,0.12)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-purple-600 text-[28px]">lock</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-1.5">
                <span>Cryptographic Isolation</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Private & Secure</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your entries and chats are strictly yours. Powered by Cloud Firestore security
                rules and private user accounts, your data is 100% private, never indexed, and
                never used to train public AI models.
              </p>
            </div>

            {/* 2. AI Conversations & Chats */}
            <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-7 sm:p-8 border border-white/80 shadow-[0_15px_45px_-10px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.95)_inset] hover:shadow-[0_20px_55px_-8px_rgba(107,56,212,0.16)] transition-all flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-100 to-indigo-100 border border-white/90 shadow-[0_6px_20px_rgba(14,165,233,0.12)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-sky-600 text-[28px]">
                  psychology
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-1.5">
                <span>Real-Time Streaming</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart AI Conversations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini chats with you naturally and writes responses in real time. The AI remembers
                what you talked about in the conversation and asks helpful questions to support you.
              </p>
            </div>

            {/* 3. Track Your Journey */}
            <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-7 sm:p-8 border border-white/80 shadow-[0_15px_45px_-10px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.95)_inset] hover:shadow-[0_20px_55px_-8px_rgba(107,56,212,0.16)] transition-all flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 border border-white/90 shadow-[0_6px_20px_rgba(244,63,94,0.12)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-rose-600 text-[28px]">
                  auto_graph
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">
                <span>Saved History</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Track Your Journey</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter chats by mood tags, search through past conversations, and view your saved
                entries whenever you return. Easily revisit past thoughts and export your notes.
              </p>
            </div>

            {/* 4. Choose Your Companion Persona */}
            <div className="rounded-3xl bg-white/75 backdrop-blur-2xl p-7 sm:p-8 border border-white/80 shadow-[0_15px_45px_-10px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.95)_inset] hover:shadow-[0_20px_55px_-8px_rgba(107,56,212,0.16)] transition-all flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-white/90 shadow-[0_6px_20px_rgba(16,185,129,0.12)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">
                  self_improvement
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                <span>Adaptive Resonance</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Choose Your Companion Persona</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Switch companions based on what your spirit requires: the serene Mindful Sage for calm,
                the Empathetic Friend for unconditional warmth, the Curious Philosopher for deep
                inquiry, or the Concise Coach for actionable clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Companion Personas Showcase Section */}
      <section id="personas" className="w-full py-16 px-4 sm:px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider uppercase mb-3">
              <span className="material-symbols-outlined text-[14px]">group</span>
              <span>The Four Companion Voices</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Attuned to how you need to be heard
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every day brings a different mood. Select the companion archetype that mirrors your
              reflective intention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Mindful Sage */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-white/80 shadow-[0_10px_30px_rgba(107,56,212,0.06)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-purple-600 text-[24px]">spa</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                  Contemplative Calm
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Mindful Sage</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Socratic stillness, poetic mindfulness, and space to breathe before answering.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-900 text-xs italic">
                &ldquo;What space exists beneath this restlessness?&rdquo;
              </div>
            </div>

            {/* Empathetic Friend */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-white/80 shadow-[0_10px_30px_rgba(107,56,212,0.06)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-pink-600 text-[24px]">favorite</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold">
                  Warm Validation
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Empathetic Friend</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Gentle active listening, emotional safety, and celebrating your small daily courage.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-100 text-pink-900 text-xs italic">
                &ldquo;I hear how much care you poured into this.&rdquo;
              </div>
            </div>

            {/* Curious Philosopher */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-white/80 shadow-[0_10px_30px_rgba(107,56,212,0.06)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-indigo-600 text-[24px]">
                    lightbulb
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                  Deep Exploration
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Curious Philosopher</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Paradigm shifts, existential inquiry, and tracing the core root of thoughts.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs italic">
                &ldquo;If this constraint dissolved, what emerges?&rdquo;
              </div>
            </div>

            {/* Concise Coach */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-white/80 shadow-[0_10px_30px_rgba(107,56,212,0.06)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-sky-600 text-[24px]">explore</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                  Action & Clarity
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Concise Coach</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Actionable takeaways, behavioral anchors, and crisp somatic check-ins.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-900 text-xs italic">
                &ldquo;Three tangible anchors for your morning.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Philosophy Section */}
      <section id="privacy" className="w-full py-16 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-purple-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-4 border border-white/10">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>The Sovereign Privacy Pledge</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                A diary should never have an audience.
              </h3>
              <p className="text-sm text-purple-100/80 leading-relaxed mb-6">
                Your thoughts are the deepest parts of who you are. PGJ is built from day one with
                dedicated user sandboxing. We do not run advertisements, we do not share your entries,
                and your private reflections will never be fed into public LLM training corpuses.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200/90 font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                  Client-side authenticated tokens
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                  Isolated Firestore security rules
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={user ? onContinueToSanctuary : onGetStarted}
                title={user ? 'Open your chat' : 'Create a free account'}
                className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-purple-50 font-bold text-sm shadow-[0_10px_25px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{user ? 'Open Chat' : 'Get Started Free'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 px-4 sm:px-6 md:px-10 border-t border-slate-200/60 mt-auto bg-white/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-0.5 border border-white/80 shadow-sm flex items-center justify-center">
              <GeminiLogo size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">PGJ — Personal Gemini Journal</p>
              <p className="text-[11px] text-slate-400">Your private space to think out loud</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => onTryProtectedFeature('chat')}
              className="hover:text-purple-700 transition-colors cursor-pointer"
            >
              Start Chat
            </button>
            <button
              type="button"
              onClick={() => onTryProtectedFeature('past-entries')}
              className="hover:text-purple-700 transition-colors cursor-pointer"
            >
              Saved Chats
            </button>
            <button
              type="button"
              onClick={() => onTryProtectedFeature('settings')}
              className="hover:text-purple-700 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Encrypted & Powered by Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

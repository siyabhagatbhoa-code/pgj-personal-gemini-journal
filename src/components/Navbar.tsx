import React, { useState, useRef, useEffect } from 'react';
import { ActiveScreen } from '../types';
import { useAuth } from '../context/AuthContext';
import { GeminiLogo } from './GeminiLogo';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onNewReflection: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, onNewReflection }) => {
  const { profile, signOutUser, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOutUser();
    setMenuOpen(false);
    setIsSigningOut(false);
  };

  return (
    <>
      {/* Top Navigation Bar for Desktop & Tablet, and Mobile Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-6 md:px-8 pt-3 sm:pt-4 pointer-events-none">
        <div className="pointer-events-auto h-14 sm:h-16 max-w-7xl mx-auto px-3.5 sm:px-6 bg-white/75 backdrop-blur-xl rounded-2xl md:rounded-full border border-white/80 shadow-[0_8px_32px_-4px_rgba(107,56,212,0.08),0_1px_2px_0_rgba(255,255,255,0.95)_inset] flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Title */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-max"
            title="Return to Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-0.5 shadow-sm border border-white/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GeminiLogo size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                PGJ
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-purple-100/80 text-purple-700 tracking-wider">
                  Journal
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:inline">
                Personal Gemini Journal
              </span>
            </div>
          </div>

          {/* Center Navigation Switcher (Desktop & Tablet: hidden on mobile in favor of bottom tab bar) */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/60 backdrop-blur-md rounded-full border border-white/60 shadow-[0_1px_2px_rgba(255,255,255,0.8)_inset]">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                currentScreen === 'home'
                  ? 'bg-white text-purple-700 shadow-[0_2px_10px_rgba(107,56,212,0.12)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                currentScreen === 'chat'
                  ? 'bg-white text-purple-700 shadow-[0_2px_10px_rgba(107,56,212,0.12)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => onNavigate('past-entries')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                currentScreen === 'past-entries'
                  ? 'bg-white text-purple-700 shadow-[0_2px_10px_rgba(107,56,212,0.12)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved Entries
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/60 backdrop-blur-md border border-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[11px] font-medium text-slate-600">Gemini AI Active</span>
            </div>

            {/* New Chat Button (Desktop & Tablet) */}
            <button
              onClick={onNewReflection}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(107,56,212,0.28),0_1px_0_rgba(255,255,255,0.3)_inset] hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>New Chat</span>
            </button>

            {/* User Profile Menu & Avatar Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                type="button"
                title="Account & Session Menu"
                className="flex items-center gap-1 p-1 rounded-full hover:bg-slate-100/80 transition-all active:scale-95 border border-transparent hover:border-slate-200/80 cursor-pointer min-w-[44px] min-h-[44px] justify-center"
              >
                <img
                  src={profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvSDoIbjmrTqPfVCActtUpvCBRmxs2voVF8HVM4A0mMB6RIHTNLt0dSo7FKf7mLzQxNx9pcbsmczK7-7MQzH1WBgTP84OoKyl-ZhzD9MYsK36V83GOIFxgky2Pv3gC7f2C0iJVFzvOJYCQ8GAz2cW9yTEBLnMrzNdjNbDeHkEVka3A2XF8r5u0kPVKWygIcQCLClTkg1VW2aBOf_hYiSApJI8yMiHLVK1ckah3xMwoC3fOAdLa9gk'}
                  alt={profile?.displayName || 'User Profile'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(107,56,212,0.15)]"
                />
                <span className="material-symbols-outlined text-[16px] text-slate-500 hidden sm:inline">
                  {menuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.15)] p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {profile?.displayName || 'My Account'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user?.email || profile?.email || 'Logged In'}
                    </p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-[18px]">home</span>
                      <span>Home</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSigningOut}
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer min-h-[44px]"
                    >
                      {isSigningOut ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                          </span>
                          <span>Logging Out...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>Log Out</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Frosted Glass Bottom Navigation Bar (md:hidden) */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white/85 backdrop-blur-2xl border-t border-white/80 shadow-[0_-4px_24px_rgba(107,56,212,0.12)] px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* 1. Home Tab */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
              currentScreen === 'home'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentScreen === 'home' ? 'text-purple-700' : 'text-slate-500'}`}>
              home
            </span>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* 2. Chat Tab */}
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
              currentScreen === 'chat'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentScreen === 'chat' ? 'text-purple-700' : 'text-slate-500'}`}>
              chat_bubble
            </span>
            <span className="text-[10px] mt-0.5">Chat</span>
          </button>

          {/* 3. Center Elevated Floating Action Button (New Chat) */}
          <div className="relative -top-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                onNewReflection();
                if (currentScreen !== 'chat') {
                  onNavigate('chat');
                }
              }}
              title="Start New Chat"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-600 text-white shadow-[0_6px_20px_rgba(107,56,212,0.45),0_1px_1px_rgba(255,255,255,0.4)_inset] flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-2 border-white"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
            <span className="text-[9px] font-bold text-purple-700 mt-1">New</span>
          </div>

          {/* 4. Saved Entries Tab */}
          <button
            type="button"
            onClick={() => onNavigate('past-entries')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
              currentScreen === 'past-entries'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentScreen === 'past-entries' ? 'text-purple-700' : 'text-slate-500'}`}>
              history_edu
            </span>
            <span className="text-[10px] mt-0.5">Saved</span>
          </button>

          {/* 5. Settings Tab */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
              currentScreen === 'settings'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentScreen === 'settings' ? 'text-purple-700' : 'text-slate-500'}`}>
              settings
            </span>
            <span className="text-[10px] mt-0.5">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveScreen } from './types';
import { AmbientBackground } from './components/AmbientBackground';
import { Navbar } from './components/Navbar';
import { LandingScreen } from './components/LandingScreen';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { JournalChatScreen } from './components/JournalChatScreen';
import { PastEntriesScreen } from './components/PastEntriesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { GeminiLogo } from './components/GeminiLogo';

function MainSanctuary() {
  const { user, loading, hasCompletedOnboarding, profile } = useAuth();
  // Landing/Home page displays FIRST when the app loads — accessible without login
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [authIsSignUp, setAuthIsSignUp] = useState<boolean>(false);
  const [pendingTargetScreen, setPendingTargetScreen] = useState<ActiveScreen | null>(null);

  // If user logs out while on a protected screen, transition safely back to public home
  useEffect(() => {
    if (!loading && !user && currentScreen !== 'home' && currentScreen !== 'auth') {
      setCurrentScreen('home');
    }
  }, [user, loading, currentScreen]);

  // When user successfully authenticates from auth screen, route to intended destination
  useEffect(() => {
    if (user && currentScreen === 'auth') {
      if (!hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        const target = pendingTargetScreen || 'chat';
        setCurrentScreen(target);
        setPendingTargetScreen(null);
      }
    }
  }, [user, hasCompletedOnboarding, currentScreen, pendingTargetScreen]);

  // Navigation with protected route checks
  const handleNavigate = (screen: ActiveScreen) => {
    if (screen === 'home') {
      setCurrentScreen('home');
      return;
    }

    if (user) {
      if (!hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen(screen);
      }
    } else {
      // Protected feature access -> redirect to Login page
      setPendingTargetScreen(screen);
      setAuthIsSignUp(false);
      setCurrentScreen('auth');
    }
  };

  const handleNewReflection = () => {
    setSelectedEntryId(null);
    handleNavigate('chat');
  };

  const handleGetStarted = () => {
    if (user) {
      if (!hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('chat');
      }
    } else {
      setPendingTargetScreen('chat');
      setAuthIsSignUp(true);
      setCurrentScreen('auth');
    }
  };

  const handleLogIn = () => {
    if (user) {
      if (!hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('chat');
      }
    } else {
      setPendingTargetScreen('chat');
      setAuthIsSignUp(false);
      setCurrentScreen('auth');
    }
  };

  const handleContinueToSanctuary = () => {
    if (user) {
      if (!hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('chat');
      }
    } else {
      handleLogIn();
    }
  };

  // If on a protected screen and still authenticating, show serene loading
  if (loading && currentScreen !== 'home' && currentScreen !== 'auth') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <AmbientBackground />
        <div className="relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_-15px_rgba(107,56,212,0.18)] max-w-sm w-full animate-fadeIn">
          {/* Pulsing Gemini Aura */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 blur-xl opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-1 border border-white/90 shadow-md flex items-center justify-center">
              <GeminiLogo size={36} animated={true} />
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
            <span>Loading Journal</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </span>
          </h3>

          <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
            Opening your journal and connecting to Gemini AI...
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50/80 border border-purple-200/60 text-[11px] font-medium text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>Private & Secure</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. First Screen / Public Landing Page (No auth required to view)
  if (currentScreen === 'home') {
    return (
      <LandingScreen
        onGetStarted={handleGetStarted}
        onLogIn={handleLogIn}
        onContinueToSanctuary={handleContinueToSanctuary}
        onTryProtectedFeature={(screen) => handleNavigate(screen)}
      />
    );
  }

  // 2. Auth Screen (Login / Sign-up)
  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen w-full relative">
        <AmbientBackground />
        <AuthScreen
          initialIsSignUp={authIsSignUp}
          onBackToHome={() => setCurrentScreen('home')}
        />
      </div>
    );
  }

  // 3. First time user onboarding
  if (user && !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen w-full relative">
        <AmbientBackground auraTone={profile?.auraTone} />
        <OnboardingScreen />
      </div>
    );
  }

  // 4. Protected Screens (Chat, Past Entries, Settings, Edit Profile)
  return (
    <div className="min-h-screen w-full relative flex flex-col selection:bg-purple-200 selection:text-purple-900">
      {/* 3D Pastel Glowing Atmospheric Orbs */}
      <AmbientBackground auraTone={profile?.auraTone} />

      {/* Persistent Glass Navigation Bar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onNewReflection={handleNewReflection}
      />

      {/* Main View Switcher with responsive spacing for top navbar and mobile bottom tab bar */}
      <main
        className={`flex-1 flex flex-col ${
          currentScreen === 'chat'
            ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pt-16 sm:pt-20 md:pt-22 pb-16 md:pb-3'
            : 'pt-20 sm:pt-24 md:pt-28 pb-24 md:pb-12 overflow-y-auto'
        }`}
      >
        {currentScreen === 'chat' && (
          <JournalChatScreen
            currentEntryId={selectedEntryId}
            onSelectEntry={(id) => setSelectedEntryId(id)}
            onNavigateToEntries={() => setCurrentScreen('past-entries')}
          />
        )}

        {currentScreen === 'past-entries' && (
          <PastEntriesScreen
            onSelectEntry={(id) => {
              setSelectedEntryId(id);
              setCurrentScreen('chat');
            }}
            onNewReflection={handleNewReflection}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen onEditProfile={() => setCurrentScreen('edit-profile')} />
        )}

        {currentScreen === 'edit-profile' && (
          <EditProfileScreen onBack={() => setCurrentScreen('settings')} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainSanctuary />
    </AuthProvider>
  );
}

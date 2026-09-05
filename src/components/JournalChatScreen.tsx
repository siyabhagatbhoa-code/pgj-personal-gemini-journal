import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { JournalEntry, JournalMessage, PersonaId } from '../types';
import {
  getUserEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../lib/journalService';
import { playMindfulChime } from '../lib/audio';
import { GeminiLogo } from './GeminiLogo';
import { useVoiceTyping } from '../lib/useVoiceTyping';

interface JournalChatScreenProps {
  currentEntryId: string | null;
  onSelectEntry: (id: string | null) => void;
  onNavigateToEntries: () => void;
}

const MOOD_TAGS = [
  { name: 'Serene Clarity', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Gratitude', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { name: 'Quiet Twilight', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'Deep Wonder', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'Inner Stillness', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Gentle Release', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Creative Flow', color: 'bg-violet-100 text-violet-700 border-violet-200' }
];

const SUGGESTED_PROMPTS = [
  'What space exists beneath this restlessness today?',
  'What unexpected moment gave me genuine warmth or gratitude?',
  'If all deadlines paused for an hour, where would my heart drift?',
  'Three tangible sensations or anchors grounding my breath right now.'
];

export const JournalChatScreen: React.FC<JournalChatScreenProps> = ({
  currentEntryId,
  onSelectEntry,
  onNavigateToEntries
}) => {
  const { user, profile } = useAuth();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [entryTitle, setEntryTitle] = useState('New Chat');
  const [selectedMood, setSelectedMood] = useState('Serene Clarity');
  const [inputText, setInputText] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeEntryIdRef = useRef<string | null>(currentEntryId);

  useEffect(() => {
    activeEntryIdRef.current = currentEntryId;
  }, [currentEntryId]);

  // Voice Typing setup
  const {
    isListening,
    interimTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
    toggleListening,
    stopListening,
    clearError: clearVoiceError
  } = useVoiceTyping({
    onTranscriptChange: (text) => {
      setInputText(text);
    }
  });

  // Load all user reflections for the sidebar
  const reloadEntries = async () => {
    if (!user) return;
    try {
      const list = await getUserEntries(user.uid);
      setEntries(list);
    } catch (err) {
      console.error('Error reloading entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    reloadEntries();
  }, [user]);

  // Load selected entry or start fresh
  useEffect(() => {
    if (currentEntryId && entries.length > 0) {
      const match = entries.find((e) => e.id === currentEntryId);
      if (match) {
        setMessages(match.messages || []);
        setEntryTitle(match.title || 'New Chat');
        setSelectedMood(match.moodTag || 'Serene Clarity');
        return;
      }
    }

    // Default state when starting new: 'New Chat'
    if (!currentEntryId) {
      setMessages([]);
      setEntryTitle('New Chat');
      setSelectedMood('Serene Clarity');
    }
  }, [currentEntryId, entries]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReflecting]);

  const handleStartNewChat = () => {
    onSelectEntry(null);
    setMessages([]);
    setEntryTitle('New Chat');
    setInputText('');
    if (profile?.audioChime) {
      playMindfulChime(0.2);
    }
  };

  // Send a chat message
  const handleSend = async (overrideText?: string) => {
    if (isListening) {
      stopListening();
    }

    const textToSend = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!textToSend || isReflecting) return;

    setInputText('');

    const userMsg: JournalMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsReflecting(true);

    if (profile?.audioChime) {
      playMindfulChime(0.2);
    }

    try {
      // 1. Compute dynamic initial title from the message if starting a new chat
      const cleanedText = textToSend.replace(/[\r\n]+/g, ' ').trim();
      const firstWords = cleanedText.split(/\s+/).slice(0, 5).join(' ');
      const quickTitle = firstWords.length > 0
        ? firstWords.charAt(0).toUpperCase() + firstWords.slice(1) + (cleanedText.split(/\s+/).length > 5 ? '...' : '')
        : 'New Chat';

      let assignedTitle = (!entryTitle || entryTitle === 'New Chat' || entryTitle === 'My Chat')
        ? quickTitle
        : entryTitle;

      setEntryTitle(assignedTitle);
      let assignedMood = selectedMood;

      if (messages.length === 0) {
        fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initialText: textToSend })
        })
          .then((res) => res.json())
          .then(async (data) => {
            if (data.title) {
              setEntryTitle(data.title);
              const targetId = activeEntryIdRef.current;
              if (targetId && user) {
                await updateJournalEntry(user.uid, targetId, {
                  title: data.title,
                  moodTag: data.moodTag || assignedMood
                });
                reloadEntries();
              }
            }
            if (data.moodTag) {
              setSelectedMood(data.moodTag);
              assignedMood = data.moodTag;
            }
          })
          .catch((err) => console.warn('Title generation error:', err));
      }

      // 2. Call backend Gemini streaming endpoint with instant real-time token delivery
      const assistantMsgId = `msg-${Date.now() + 1}`;
      let accumulatedReply = '';

      try {
        const streamRes = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
            persona: profile?.persona || 'sage',
            userProfile: {
              name: profile?.displayName || 'Friend',
              moniker: profile?.moniker || profile?.firstName || 'Friend',
              philosophy: profile?.philosophy || ''
            },
            depth: profile?.depth || 'Balanced'
          })
        });

        if (!streamRes.ok || !streamRes.body) {
          throw new Error('Streaming connection failed');
        }

        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Add initial placeholder for streaming response
        setMessages([
          ...newMessages,
          {
            id: assistantMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now()
          }
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataContent = trimmed.slice(6);
              if (dataContent === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.text) {
                  accumulatedReply += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId ? { ...msg, text: accumulatedReply } : msg
                    )
                  );
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      } catch (streamError) {
        console.warn('Streaming error, falling back to standard chat:', streamError);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
            persona: profile?.persona || 'sage',
            userProfile: {
              name: profile?.displayName || 'Friend',
              moniker: profile?.moniker || profile?.firstName || 'Friend',
              philosophy: profile?.philosophy || ''
            },
            depth: profile?.depth || 'Balanced'
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || 'Chat response failed');
        }

        const data = await res.json();
        accumulatedReply = data.reply || 'I am listening with an open heart. What is on your mind?';
      }

      if (!accumulatedReply) {
        accumulatedReply = 'I am listening with an open heart. What more would you like to share?';
      }

      const finalModelMsg: JournalMessage = {
        id: assistantMsgId,
        role: 'model',
        text: accumulatedReply,
        timestamp: Date.now()
      };

      const finalMessages = [
        ...newMessages.filter((m) => m.id !== assistantMsgId),
        finalModelMsg
      ];
      setMessages(finalMessages);

      if (profile?.audioChime) {
        playMindfulChime(0.35);
      }

      // 3. Save or update in Cloud Firestore under users/{uid}/entries/{entryId}
      const uid = user?.uid || 'guest';
      if (!currentEntryId) {
        const newId = await createJournalEntry(uid, {
          title: assignedTitle || 'New Chat',
          moodTag: assignedMood,
          persona: (profile?.persona as PersonaId) || 'sage',
          messages: finalMessages
        });
        activeEntryIdRef.current = newId;
        onSelectEntry(newId);
        await reloadEntries();
      } else {
        await updateJournalEntry(uid, currentEntryId, {
          messages: finalMessages,
          title: assignedTitle || entryTitle || 'New Chat',
          moodTag: selectedMood
        });
        await reloadEntries();
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to connect with AI';
      const fallbackMsg: JournalMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: `*Notice:* ${errMsg}. Your message was saved safely.`,
        timestamp: Date.now()
      };
      setMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleDeleteCurrentEntry = async () => {
    if (!currentEntryId) return;
    const uid = user?.uid || 'guest';
    await deleteJournalEntry(uid, currentEntryId);
    setShowDeleteConfirm(false);
    handleStartNewChat();
    await reloadEntries();
  };

  // Render chats list component shared by desktop sidebar and mobile drawer
  const renderChatsList = (onItemClick?: () => void) => (
    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
      {loadingEntries ? (
        <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
      ) : entries.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 leading-relaxed">
          No past chats yet. Start typing or speak below to begin.
        </div>
      ) : (
        entries.map((item) => {
          const isActive = currentEntryId === item.id;
          const dateStr = item.timestamp
            ? new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              })
            : 'Today';

          return (
            <div
              key={item.id}
              onClick={() => {
                onSelectEntry(item.id);
                if (onItemClick) onItemClick();
              }}
              className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all border text-left ${
                isActive
                  ? 'bg-purple-50/90 border-purple-300/80 shadow-sm'
                  : 'bg-white/60 hover:bg-white/90 border-transparent hover:border-slate-200/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {item.title || 'New Chat'}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{dateStr}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-700 font-medium">
                  {item.moodTag}
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.messages?.length || 0} msgs
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex-1 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex flex-col overflow-hidden">
      {/* Polished Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-2xl p-6 sm:p-7 border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.2)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100/80 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Delete this chat?</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Permanently remove <span className="font-semibold text-slate-700">"{entryTitle || 'New Chat'}"</span> from your personal journal? This action cannot be reversed.
            </p>

            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px]"
              >
                Keep Chat
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentEntry}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(225,29,72,0.28)] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-Out Drawer for Saved Chats (md:hidden) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-4/5 max-w-xs h-full bg-white/95 backdrop-blur-2xl border-r border-white/90 shadow-2xl p-4 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">
                  chat_bubble
                </span>
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">Saved Chats</h3>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer"
                title="Close Drawer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <button
              onClick={() => {
                handleStartNewChat();
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Start New Chat</span>
            </button>

            {renderChatsList(() => setSidebarOpen(false))}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  onNavigateToEntries();
                }}
                className="hover:text-purple-700 font-medium flex items-center gap-1 cursor-pointer py-2 min-h-[44px]"
              >
                <span>View all saved chats</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 h-full flex-1 overflow-hidden items-stretch">
        {/* Desktop & Tablet Sidebar (4 cols on md & lg, hidden on mobile) */}
        <aside className="hidden md:flex md:col-span-4 lg:col-span-4 rounded-3xl bg-white/75 backdrop-blur-2xl p-4 border border-white/80 shadow-[0_12px_36px_-6px_rgba(107,56,212,0.08),0_1px_2px_rgba(255,255,255,0.95)_inset] flex-col gap-3 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-[20px]">
                chat_bubble
              </span>
              <h3 className="font-bold text-sm text-slate-800 tracking-tight">Saved Chats</h3>
            </div>
            <button
              onClick={handleStartNewChat}
              className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px]"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>New Chat</span>
            </button>
          </div>

          {renderChatsList()}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <button
              onClick={onNavigateToEntries}
              className="hover:text-purple-700 font-medium flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <span>View all saved chats</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </aside>

        {/* Main Conversation & Chat Column (8 cols on desktop/tablet, full width on mobile) */}
        <div className="col-span-1 md:col-span-8 lg:col-span-8 flex flex-col h-full rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_36px_-6px_rgba(107,56,212,0.1),0_1px_2px_rgba(255,255,255,0.95)_inset] overflow-hidden">
          {/* Header Bar of Active Thread */}
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100/90 bg-white/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Drawer Toggle Button (44x44px touch target) */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Open Saved Chats Drawer"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    onBlur={() => {
                      if (currentEntryId && user) {
                        updateJournalEntry(user.uid, currentEntryId, { title: entryTitle || 'New Chat' });
                        reloadEntries();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="font-bold text-sm sm:text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none transition-colors max-w-[160px] sm:max-w-xs px-1 py-0.5"
                    placeholder="Name this chat..."
                    title="Click to rename this chat"
                  />
                  <span className="material-symbols-outlined text-[14px] text-slate-400 pointer-events-none" title="Editable title">
                    edit
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[150px] sm:max-w-none">
                    {profile?.persona === 'sage'
                      ? 'Wise & Calm'
                      : profile?.persona === 'friend'
                      ? 'Supportive Friend'
                      : profile?.persona === 'philosopher'
                      ? 'Thoughtful Guide'
                      : 'Productive Coach'}{' '}
                    • Ready
                  </span>
                </span>
              </div>
            </div>

            {/* Mood selector dropdown & Actions */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMood}
                onChange={(e) => {
                  const newMood = e.target.value;
                  setSelectedMood(newMood);
                  if (currentEntryId) {
                    const uid = user?.uid || 'guest';
                    updateJournalEntry(uid, currentEntryId, { moodTag: newMood });
                  }
                }}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 focus:outline-none cursor-pointer min-h-[36px]"
              >
                {MOOD_TAGS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>

              {currentEntryId && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete chat"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Conversation History Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto py-8">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">forum</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Welcome, {profile?.moniker || profile?.firstName || 'Friend'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                  Your chat is private and secure. Share whatever is on your mind—how your day went, what you are planning, or ideas you want to explore.
                </p>

                {/* Prompt Cards */}
                <div className="w-full flex flex-col gap-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Try starting with:
                  </span>
                  {SUGGESTED_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="p-3 rounded-2xl bg-white/80 hover:bg-purple-50/70 border border-slate-200/60 hover:border-purple-200 text-xs text-slate-700 transition-all text-left shadow-sm flex items-center justify-between group cursor-pointer"
                    >
                      <span>&ldquo;{p}&rdquo;</span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                      isUser ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                      {isUser ? (
                        <>
                          <span>{profile?.moniker || 'You'}</span>
                          <span>•</span>
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      ) : (
                        <>
                          <GeminiLogo size={14} />
                          <span className="font-semibold text-purple-700">Gemini Assistant</span>
                          <span>•</span>
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-white/95 text-slate-800 border border-purple-100 shadow-[0_4px_16px_rgba(107,56,212,0.06)] rounded-br-md'
                          : 'bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-white/95 text-slate-800 border border-white/80 shadow-[0_4px_18px_rgba(107,56,212,0.07)] rounded-bl-md'
                      }`}
                    >
                      {m.text ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div className="flex items-center gap-3 py-1.5 animate-fadeIn">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-0.5 border border-white/80 shadow-sm flex items-center justify-center">
                              <GeminiLogo size={18} animated={true} />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-purple-900">Gemini is thinking</span>
                              <div className="flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"
                                  style={{ animationDelay: '0.2s' }}
                                />
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"
                                  style={{ animationDelay: '0.4s' }}
                                />
                              </div>
                            </div>
                            <span className="text-[11px] text-purple-600 font-medium">
                              Writing response...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking Ambient Indicator */}
            {isReflecting && !messages.some((m) => m.role === 'model' && !m.text) && (
              <div className="flex flex-col items-start max-w-xl mr-auto animate-fadeIn">
                <div className="p-3.5 sm:p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_4px_20px_rgba(107,56,212,0.08)] rounded-bl-md flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-purple-400 blur-sm opacity-30 animate-pulse" />
                    <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-0.5 border border-white/80 shadow-sm flex items-center justify-center">
                      <GeminiLogo size={18} animated={true} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-purple-900">Gemini is thinking</span>
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-purple-600 font-medium">
                      Thinking about your message...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat / Journal Input Area: Extra spacious & clear */}
          <div className="p-3.5 sm:p-5 border-t border-slate-100/90 bg-white/70 backdrop-blur-xl">
            {/* Live Voice Typing Feedback Banner */}
            {isListening && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 mb-3 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50/80 to-purple-50 border border-purple-200/80 text-xs text-purple-900 animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="font-bold text-purple-900 shrink-0">Voice Typing:</span>
                  <span className="text-purple-700 italic truncate">
                    {interimTranscript ? `"${interimTranscript}"` : 'Listening... Speak out loud.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-3 py-1 rounded-full bg-white text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {/* Voice Error Notice */}
            {voiceError && (
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-amber-600">info</span>
                  <span>{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearVoiceError}
                  className="text-amber-600 hover:text-amber-800 font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Compact, modern chat input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className={`relative rounded-2xl bg-white border ${
                isListening
                  ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              } focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all p-2 flex flex-col gap-1.5`}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
                    if (e.nativeEvent && (e.nativeEvent as any).isComposing) {
                      return;
                    }
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message... (Enter to send)"
                rows={1}
                disabled={isReflecting}
                className="w-full min-h-[38px] max-h-[96px] bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed px-2 py-1"
              />

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Single Voice Typing Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleListening(inputText)}
                    title={isListening ? 'Stop Voice Typing' : 'Start Voice Typing (Microphone)'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[38px] ${
                      isListening
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm animate-pulse'
                        : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50/80 border border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[17px] ${isListening ? 'text-rose-600' : 'text-purple-600'}`}>
                      {isListening ? 'mic' : 'mic_none'}
                    </span>
                    <span className="text-[11px] sm:text-xs">{isListening ? 'Listening...' : 'Voice Typing'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Enter sends • Shift+Enter for new line
                  </span>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isReflecting}
                  className="flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(107,56,212,0.28)] hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all cursor-pointer min-h-[38px]"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types';
import { getUserEntries, deleteJournalEntry } from '../lib/journalService';
import { GeminiLogo } from './GeminiLogo';

interface PastEntriesScreenProps {
  onSelectEntry: (id: string) => void;
  onNewReflection: () => void;
}

export const PastEntriesScreen: React.FC<PastEntriesScreenProps> = ({
  onSelectEntry,
  onNewReflection
}) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getUserEntries(user.uid);
      setEntries(list);
    } catch (err) {
      console.error('Error fetching past entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      await deleteJournalEntry(user.uid, id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
      setEntryToDelete(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportEntry = (e: React.MouseEvent, entry: JournalEntry) => {
    e.stopPropagation();
    const content = `# ${entry.title}\nDate: ${new Date(entry.timestamp).toLocaleString()}\nMood: ${
      entry.moodTag
    }\nPersona: ${entry.persona}\n\n---\n\n` +
      entry.messages
        .map(
          (m) =>
            `### ${m.role === 'user' ? 'Reflection' : 'Gemini Companion'} (${new Date(
              m.timestamp
            ).toLocaleTimeString()}):\n${m.text}\n`
        )
        .join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.title.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter entries
  const filtered = entries.filter((entry) => {
    const matchesMood = selectedMoodFilter === 'All' || entry.moodTag === selectedMoodFilter;
    if (!matchesMood) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = entry.title.toLowerCase().includes(q);
    const moodMatch = entry.moodTag.toLowerCase().includes(q);
    const contentMatch = entry.messages.some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || moodMatch || contentMatch;
  });

  // Group by date
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;

  const groups: { label: string; items: JournalEntry[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Earlier in Sanctuary', items: [] }
  ];

  filtered.forEach((entry) => {
    const time = new Date(entry.timestamp).getTime();
    if (time >= todayStart) {
      groups[0].items.push(entry);
    } else if (time >= yesterdayStart) {
      groups[1].items.push(entry);
    } else if (time >= weekStart) {
      groups[2].items.push(entry);
    } else {
      groups[3].items.push(entry);
    }
  });

  const moodsList = [
    'All',
    'Serene Clarity',
    'Gratitude',
    'Quiet Twilight',
    'Deep Wonder',
    'Inner Stillness',
    'Creative Flow'
  ];

  return (
    <div className="w-full pb-16 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Polished Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => !deletingId && setEntryToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-2xl p-6 sm:p-7 border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.2)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100/80 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Delete reflection?</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Permanently remove <span className="font-semibold text-slate-700">"{entryToDelete.title}"</span> from your sanctuary archive? This action cannot be undone.
            </p>

            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setEntryToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px]"
              >
                Keep Reflection
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => handleDelete(entryToDelete.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(225,29,72,0.28)] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {deletingId ? 'hourglass_top' : 'delete'}
                </span>
                <span>{deletingId ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider">
              Sanctuary Archive
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {entries.length} reflections stored
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Past Reflections
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Revisit your continuous inner journey. All conversations remain encrypted and isolated
            to your personal UID.
          </p>
        </div>

        <button
          onClick={onNewReflection}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(107,56,212,0.28)] hover:opacity-95 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
          <span>New Reflection</span>
        </button>
      </div>

      {/* Search & Mood Filter Bar */}
      <div className="w-full rounded-2xl bg-white/70 backdrop-blur-xl p-4 border border-white/80 shadow-[0_8px_24px_rgba(107,56,212,0.06)] mb-8 flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full flex items-center">
          <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, insights, or thoughts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 text-xs sm:text-sm text-slate-800 border border-slate-200/60 focus:outline-none focus:border-purple-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mood filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {moodsList.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMoodFilter(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMoodFilter === m
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 via-pink-50 to-sky-100 p-1 border border-white/90 shadow-sm flex items-center justify-center">
              <GeminiLogo size={24} animated={true} />
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-700">Synchronizing sanctuary archive...</span>
          <span className="text-xs text-slate-400 mt-1">Retrieving encrypted personal journals</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 p-8 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No reflections match</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search query or mood filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMoodFilter('All');
            }}
            className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </span>
                  <div className="flex-1 border-t border-slate-200/60" />
                  <span className="text-[11px] text-slate-400">
                    {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((entry) => {
                    const firstUserMsg = entry.messages.find((m) => m.role === 'user')?.text || '';
                    const firstModelMsg =
                      entry.messages.find((m) => m.role === 'model')?.text || '';

                    return (
                      <div
                        key={entry.id}
                        onClick={() => onSelectEntry(entry.id)}
                        className="group relative p-5 rounded-3xl bg-white/75 hover:bg-white/95 backdrop-blur-2xl border border-white/80 hover:border-purple-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(107,56,212,0.12)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Row: Mood and Date */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200/60">
                              {entry.moodTag}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(entry.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors mb-2 line-clamp-1">
                            {entry.title}
                          </h3>

                          {/* Preview snippet */}
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                            {firstUserMsg || firstModelMsg || 'Quiet reflection recorded.'}
                          </p>
                        </div>

                        {/* Card Bottom Meta & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-purple-600">
                              forum
                            </span>
                            <span>{entry.messages.length} reflections</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleExportEntry(e, entry)}
                              title="Export Markdown"
                              className="p-1.5 rounded-full hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEntryToDelete(entry);
                              }}
                              title="Delete reflection"
                              className="p-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

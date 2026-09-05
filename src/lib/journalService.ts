import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalEntry, JournalMessage, PersonaId } from '../types';

export async function getUserEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    let snapshot;
    try {
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    } catch (queryErr) {
      console.warn('Fallback: query by createdAt failed, fetching collection directly:', queryErr);
      snapshot = await getDocs(entriesRef);
    }

    const entries: JournalEntry[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      entries.push({
        id: d.id,
        userId,
        title: data.title || 'Untitled Reflection',
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        moodTag: data.moodTag || 'Serene Clarity',
        persona: (data.persona as PersonaId) || 'sage',
        messages: Array.isArray(data.messages) ? data.messages : []
      });
    });

    // Ensure entries are always sorted newest to oldest
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return entries;
  } catch (err) {
    console.error('Error fetching user entries from Firestore:', err);
    // Return empty array on permission or network error
    return [];
  }
}

export async function createJournalEntry(
  userId: string,
  entryData: {
    title: string;
    moodTag: string;
    persona: PersonaId;
    messages: JournalMessage[];
  }
): Promise<string> {
  const entriesRef = collection(db, 'users', userId, 'entries');
  const newDocRef = doc(entriesRef);
  const now = new Date();

  await setDoc(newDocRef, {
    title: entryData.title,
    moodTag: entryData.moodTag,
    persona: entryData.persona,
    messages: entryData.messages,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timestamp: now.toISOString()
  });

  // Increment total reflections in user profile doc
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        reflectionsCount: increment(1),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.debug('Could not increment reflectionsCount:', err);
  }

  return newDocRef.id;
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  data: {
    messages?: JournalMessage[];
    title?: string;
    moodTag?: string;
  }
): Promise<void> {
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await updateDoc(entryRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
}

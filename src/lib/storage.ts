import { StorageSchema, CoverLetterEntry } from '../types';

export async function getResume(): Promise<StorageSchema['resume']> {
  const result = await chrome.storage.local.get('resume');
  return result.resume || null;
}

export async function saveResume(data: NonNullable<StorageSchema['resume']>): Promise<void> {
  await chrome.storage.local.set({ resume: data });
}

export async function getGeminiApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get('geminiApiKey');
  return result.geminiApiKey || null;
}

export async function saveGeminiApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ geminiApiKey: key });
}

export async function getLastJD(): Promise<StorageSchema['lastExtractedJD']> {
  const result = await chrome.storage.local.get('lastExtractedJD');
  return result.lastExtractedJD || null;
}

export async function saveLastJD(data: NonNullable<StorageSchema['lastExtractedJD']>): Promise<void> {
  await chrome.storage.local.set({ lastExtractedJD: data });
}

export async function getCoverLetters(): Promise<CoverLetterEntry[]> {
  const result = await chrome.storage.local.get('coverLetters');
  return result.coverLetters || [];
}

export async function saveCoverLetter(entry: CoverLetterEntry): Promise<void> {
  const letters = await getCoverLetters();
  
  letters.unshift(entry);
  
  if (letters.length > 20) {
    letters.length = 20; // Keep only newest 20
  }
  
  await chrome.storage.local.set({ coverLetters: letters });
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const letters = await getCoverLetters();
  const updated = letters.filter((l) => l.id !== id);
  await chrome.storage.local.set({ coverLetters: updated });
}
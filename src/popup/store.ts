import { create } from 'zustand';
import { StorageSchema, CoverLetterEntry } from '../types';
import { 
  getResume, saveResume, 
  getGeminiApiKey, saveGeminiApiKey,
  getCoverLetters, deleteCoverLetter, saveCoverLetter
} from '../lib/storage';
import { parseJDMetadata } from '../lib/gemini';

interface AppState {
  screen: 'SETUP' | 'MAIN' | 'OUTPUT';
  isHistoryDrawerOpen: boolean;
  
  // Storage state
  resume: StorageSchema['resume'];
  apiKey: string | null;
  history: CoverLetterEntry[];
  
  // Active output state
  activeJD: string;
  activeSourceUrl: string;
  generatedLetter: string;
  isGenerating: boolean;
  generationError: string | null;
  currentLetterId: string | null;

  // Actions
  init: () => Promise<void>;
  setScreen: (screen: 'SETUP' | 'MAIN' | 'OUTPUT') => void;
  toggleHistoryDrawer: () => void;
  
  updateApiKey: (key: string) => Promise<void>;
  updateResume: (rawText: string, fileName: string) => Promise<void>;
  
  setActiveJD: (jd: string, url?: string) => void;
  
  startGeneration: () => void;
  appendChunk: (chunk: string) => void;
  completeGeneration: () => Promise<void>;
  failGeneration: (error: string) => void;
  
  loadLetterFromHistory: (id: string) => void;
  removeLetterFromHistory: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'SETUP',
  isHistoryDrawerOpen: false,
  
  resume: null,
  apiKey: null,
  history: [],
  
  activeJD: '',
  activeSourceUrl: '',
  generatedLetter: '',
  isGenerating: false,
  generationError: null,
  currentLetterId: null,

  init: async () => {
    const [resume, storedApiKey, history] = await Promise.all([
      getResume(),
      getGeminiApiKey(),
      getCoverLetters()
    ]);
    
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const resolvedApiKey = envApiKey || storedApiKey;
    
    set({
      resume,
      apiKey: resolvedApiKey,
      history,
      screen: (resume && resolvedApiKey) ? 'MAIN' : 'SETUP'
    });
  },

  setScreen: (screen) => set({ screen }),
  toggleHistoryDrawer: () => set(state => ({ isHistoryDrawerOpen: !state.isHistoryDrawerOpen })),
  
  updateApiKey: async (key: string) => {
    await saveGeminiApiKey(key);
    set({ apiKey: key });
  },
  
  updateResume: async (rawText: string, fileName: string) => {
    const resumeData = { rawText, fileName, uploadedAt: Date.now() };
    await saveResume(resumeData);
    set({ resume: resumeData });
  },

  setActiveJD: (jd, url = '') => set({ activeJD: jd, activeSourceUrl: url }),

  startGeneration: () => {
    set({ 
      isGenerating: true, 
      generatedLetter: '', 
      generationError: null,
      screen: 'OUTPUT',
      currentLetterId: null
    });
  },
  
  appendChunk: (chunk: string) => {
    set(state => ({ generatedLetter: state.generatedLetter + chunk }));
  },
  
  completeGeneration: async () => {
    const state = get();
    set({ isGenerating: false });
    
    if (!state.apiKey) return;
    
    // Parse metadata in background (or here in UI, it's fast)
    const metadata = await parseJDMetadata(state.activeJD, state.apiKey);
    
    const entry: CoverLetterEntry = {
      id: crypto.randomUUID(),
      jobTitle: metadata.jobTitle,
      company: metadata.company,
      jobDescription: state.activeJD,
      coverLetter: state.generatedLetter,
      createdAt: Date.now(),
      sourceUrl: state.activeSourceUrl
    };
    
    await saveCoverLetter(entry);
    const updatedHistory = await getCoverLetters();
    set({ history: updatedHistory, currentLetterId: entry.id });
  },
  
  failGeneration: (error: string) => {
    set({ isGenerating: false, generationError: error });
  },

  loadLetterFromHistory: (id: string) => {
    const state = get();
    const letter = state.history.find(l => l.id === id);
    if (letter) {
      set({
        screen: 'OUTPUT',
        generatedLetter: letter.coverLetter,
        activeJD: letter.jobDescription,
        currentLetterId: id,
        isHistoryDrawerOpen: false
      });
    }
  },
  
  removeLetterFromHistory: async (id: string) => {
    await deleteCoverLetter(id);
    const updatedHistory = await getCoverLetters();
    set({ history: updatedHistory });
    
    const state = get();
    if (state.currentLetterId === id && state.screen === 'OUTPUT') {
      set({ screen: 'MAIN' });
    }
  }
}));
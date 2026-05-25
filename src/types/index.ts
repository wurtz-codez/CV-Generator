export interface StorageSchema {
  resume: { rawText: string; fileName: string; uploadedAt: number } | null;
  geminiApiKey: string | null;
  coverLetters: CoverLetterEntry[];
  lastExtractedJD: { text: string; sourceUrl: string; extractedAt: number } | null;
}

export interface CoverLetterEntry {
  id: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  coverLetter: string;
  createdAt: number;
  sourceUrl: string;
}

export type ExtractorMessage = {
  type: 'SCRAPE_PAGE';
};

export type BackgroundMessage = 
  | { type: 'EXTRACT_JD' }
  | { type: 'GENERATE_LETTER'; resume: string; jd: string; apiKey: string };

export type StreamMessage = 
  | { type: 'STREAM_CHUNK'; chunk: string }
  | { type: 'STREAM_COMPLETE' }
  | { type: 'STREAM_ERROR'; error: string };

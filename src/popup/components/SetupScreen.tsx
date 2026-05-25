import { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { validateApiKey } from '../../lib/gemini';
import { parsePDF } from '../../lib/pdfParser';
import { Check, Loader2, Upload } from 'lucide-react';

export function SetupScreen() {
  const { apiKey, resume, updateApiKey, updateResume, setScreen } = useAppStore();
  
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [isParsing, setIsParsing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidate = async () => {
    if (!keyInput.trim()) return;
    setIsValidating(true);
    setKeyStatus('idle');
    const isValid = await validateApiKey(keyInput);
    if (isValid) {
      await updateApiKey(keyInput);
      setKeyStatus('success');
    } else {
      setKeyStatus('error');
    }
    setIsValidating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsing(true);
    setPdfError(null);
    try {
      const text = await parsePDF(file);
      await updateResume(text, file.name);
    } catch (err) {
      setPdfError("Could not read PDF. Try copy-pasting resume text.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canContinue = !!apiKey && !!resume && keyStatus !== 'error';

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="text-center mt-4">
        <h1 className="text-xl font-bold text-gray-800">Welcome to AI Cover Letter</h1>
        <p className="text-sm text-gray-500 mt-1">Let's set up your profile to get started.</p>
      </div>

      <div className="space-y-4 flex-1">
        {/* API Key Section */}
        {!import.meta.env.VITE_GEMINI_API_KEY && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setKeyStatus('idle');
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="AIzaSy..."
              />
              <button
                onClick={handleValidate}
                disabled={isValidating || !keyInput}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-medium transition-colors flex items-center"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Validate'}
              </button>
            </div>
            {keyStatus === 'success' && <p className="text-xs text-green-600 flex items-center"><Check className="w-3 h-3 mr-1"/> Valid key saved</p>}
            {keyStatus === 'error' && <p className="text-xs text-red-500">Invalid API key</p>}
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline block">
              Get your free Gemini API key at aistudio.google.com
            </a>
          </div>
        )}

        {/* Resume Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Your Resume (PDF)</label>
          
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />

          {!resume ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
            >
              {isParsing ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload PDF</p>
                  <p className="text-xs text-gray-500 mt-1">Maximum 5MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-900 truncate">{resume.fileName}</span>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-2"
                >
                  Change
                </button>
              </div>
              
              <details className="text-xs group">
                <summary className="text-gray-500 cursor-pointer hover:text-gray-700">Preview extracted text</summary>
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 max-h-32 overflow-y-auto text-gray-600 whitespace-pre-wrap">
                  {resume.rawText}
                </div>
              </details>
            </div>
          )}
          {pdfError && <p className="text-xs text-red-500">{pdfError}</p>}
        </div>
      </div>

      <button
        onClick={() => setScreen('MAIN')}
        disabled={!canContinue}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue to Generator
      </button>
    </div>
  );
}
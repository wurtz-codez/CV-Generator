import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Sparkles, FileText, History, Link as LinkIcon, AlertTriangle } from 'lucide-react';

export function MainScreen() {
  const { 
    resume, apiKey, toggleHistoryDrawer, activeJD, setActiveJD, 
    startGeneration, failGeneration,
    activeSourceUrl
  } = useAppStore();
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const charCount = activeJD.length;
  const isTooLong = charCount > 8000;

  useEffect(() => {
    if (isTooLong) {
      setActiveJD(activeJD.slice(0, 8000), activeSourceUrl);
    }
  }, [activeJD, isTooLong, setActiveJD, activeSourceUrl]);

  const handleExtract = () => {
    setIsExtracting(true);
    setExtractError(null);
    
    chrome.runtime.sendMessage(
      { type: 'EXTRACT_JD' },
      (response: any) => {
        setIsExtracting(false);
        if (chrome.runtime.lastError) {
          setExtractError("Could not connect to page. Try refreshing.");
          return;
        }
        if (response?.error) {
          setExtractError(response.error);
        } else if (response?.success && response.data) {
          setActiveJD(response.data.text, response.data.sourceUrl);
        }
      }
    );
  };

  const handleGenerate = () => {
    if (!resume || !apiKey || !activeJD) return;
    
    startGeneration();
    
    chrome.runtime.sendMessage(
      { type: 'GENERATE_LETTER', resume: resume.rawText, jd: activeJD, apiKey },
      (_response: any) => {
         if (chrome.runtime.lastError) {
           failGeneration("Connection error. Try again.");
         }
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-gray-800">Cover Letter AI</h1>
        </div>
        <button 
          onClick={toggleHistoryDrawer}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <span className={`text-xs ${isTooLong ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
              {charCount}/8000
            </span>
          </div>
          
          <div className="relative">
            <textarea
              value={activeJD}
              onChange={(e) => setActiveJD(e.target.value, '')}
              className="w-full h-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Paste job description here, or click 'Extract from Page' if you are on a job board like LinkedIn or Indeed."
            />
            {isTooLong && (
              <div className="absolute top-2 right-2 flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium border border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" /> Trimmed
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
            >
              {isExtracting ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Extracting...</>
              ) : (
                <><LinkIcon className="w-4 h-4 mr-1" /> Extract from Page</>
              )}
            </button>
            
            {activeSourceUrl && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full max-w-[150px] truncate" title={activeSourceUrl}>
                {new URL(activeSourceUrl).hostname}
              </span>
            )}
          </div>
          {extractError && <p className="text-xs text-red-500 mt-1">{extractError}</p>}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        <button
          onClick={handleGenerate}
          disabled={!activeJD.trim() || !resume}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Cover Letter
        </button>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center truncate">
            <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">Using: {resume?.fileName}</span>
          </div>
          <button 
            onClick={() => useAppStore.getState().setScreen('SETUP')}
            className="text-blue-600 hover:underline ml-2 flex-shrink-0"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Ensure Loader2 is imported
import { Loader2 } from 'lucide-react';
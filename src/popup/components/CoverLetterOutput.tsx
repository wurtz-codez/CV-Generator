import { useState } from 'react';
import { useAppStore } from '../store';
import { ArrowLeft, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';

export function CoverLetterOutput() {
  const { 
    generatedLetter, isGenerating, generationError, setScreen, 
    startGeneration, activeJD, resume, apiKey, currentLetterId
  } = useAppStore();
  
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!generatedLetter) return;
    await navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (!resume || !apiKey || !activeJD) return;
    
    startGeneration();
    chrome.runtime.sendMessage({ 
      type: 'GENERATE_LETTER', 
      resume: resume.rawText, 
      jd: activeJD, 
      apiKey 
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button 
          onClick={() => setScreen('MAIN')}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-800">Your Cover Letter</h1>
        <div className="w-5" /> {/* Spacer */}
      </header>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {generationError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="text-red-500 bg-red-50 p-3 rounded-full">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-700">{generationError}</p>
            <button 
              onClick={handleRegenerate}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif">
              {generatedLetter || (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>Drafting your letter...</p>
                </div>
              )}
            </div>
            
            {/* Toolbar */}
            <div className="border-t border-gray-100 bg-gray-50 p-2 flex items-center justify-between">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </button>

              <button
                onClick={handleCopy}
                disabled={isGenerating || !generatedLetter}
                className={`flex items-center px-4 py-1.5 text-xs font-medium rounded text-white transition-colors disabled:opacity-50 ${
                  copied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Text</>
                )}
              </button>
            </div>
            
            {/* Auto-save notification */}
            {!isGenerating && currentLetterId && (
              <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded shadow-sm opacity-80 flex items-center">
                <Check className="w-3 h-3 mr-1" /> Saved to history
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
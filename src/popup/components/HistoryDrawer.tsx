import { useAppStore } from '../store';
import { X, Trash2, FileText, ChevronRight } from 'lucide-react';

export function HistoryDrawer() {
  const { isHistoryDrawerOpen, toggleHistoryDrawer, history, loadLetterFromHistory, removeLetterFromHistory } = useAppStore();

  if (!isHistoryDrawerOpen) return null;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={toggleHistoryDrawer}
      />
      
      {/* Drawer */}
      <div className="relative w-80 bg-white shadow-xl h-full flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">History</h2>
          <button 
            onClick={toggleHistoryDrawer}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
              <FileText className="w-8 h-8 opacity-50" />
              <p className="text-sm">No cover letters yet</p>
            </div>
          ) : (
            history.map((letter) => (
              <div 
                key={letter.id}
                className="group flex flex-col p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate pr-2">{letter.company}</h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate mb-3">{letter.jobTitle}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLetterFromHistory(letter.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => loadLetterFromHistory(letter.id)}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
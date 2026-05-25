import { useEffect } from 'react';
import { useAppStore } from './store';
import { SetupScreen } from './components/SetupScreen';
import { MainScreen } from './components/MainScreen';
import { CoverLetterOutput } from './components/CoverLetterOutput';
import { HistoryDrawer } from './components/HistoryDrawer';
import { StreamMessage } from '../types';

export function App() {
  const { screen, init, appendChunk, completeGeneration, failGeneration } = useAppStore();

  useEffect(() => {
    init();

    // Listen for streaming chunks from background
    const listener = (message: StreamMessage) => {
      if (message.type === 'STREAM_CHUNK') {
        appendChunk(message.chunk);
      } else if (message.type === 'STREAM_COMPLETE') {
        completeGeneration();
      } else if (message.type === 'STREAM_ERROR') {
        failGeneration(message.error);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [init, appendChunk, completeGeneration, failGeneration]);

  return (
    <div className="relative w-full h-full bg-white text-gray-900 font-sans overflow-hidden flex flex-col">
      {screen === 'SETUP' && <SetupScreen />}
      {screen === 'MAIN' && <MainScreen />}
      {screen === 'OUTPUT' && <CoverLetterOutput />}
      
      <HistoryDrawer />
    </div>
  );
}
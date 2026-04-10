import { useEffect, useState } from 'react';
import { RitualProvider } from './context/RitualContext';
import { BoardRoot } from './components/board/BoardRoot';
import { PilotRoot } from './components/pilot/PilotRoot';

function App() {
  const [mode, setMode] = useState<'selection' | 'board' | 'pilot'>('selection');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'board') setMode('board');
    if (modeParam === 'pilot') setMode('pilot');
  }, []);

  if (mode === 'selection') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forest-gradient gap-8 p-4">
        <h1 className="text-4xl font-bold text-sasquach-gold tracking-widest">SASQUACH V1.0</h1>
        <p className="text-stone-400 italic">"The Why drives the How"</p>
        <div className="flex gap-6">
          <button 
            onClick={() => window.location.search = '?mode=board'}
            className="px-8 py-4 bg-forest-800 border border-forest-700 rounded-lg hover:border-sasquach-gold transition-all group"
          >
            <span className="block text-xl font-bold">BOARD</span>
            <span className="text-xs text-stone-500 uppercase tracking-tighter">The Mirror (Projector)</span>
          </button>
          <button 
            onClick={() => window.location.search = '?mode=pilot'}
            className="px-8 py-4 bg-stone-900 border border-stone-800 rounded-lg hover:border-sasquach-gold transition-all group"
          >
            <span className="block text-xl font-bold">PILOT</span>
            <span className="text-xs text-stone-500 uppercase tracking-tighter">The Control (Mobile)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <RitualProvider mode={mode}>
      {mode === 'board' ? <BoardRoot /> : <PilotRoot />}
    </RitualProvider>
  );
}

export default App;

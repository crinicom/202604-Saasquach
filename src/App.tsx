import { useEffect, useState } from 'react';
import { RitualProvider } from './context/RitualContext';
import { BoardRoot } from './components/board/BoardRoot';
import { PilotRoot } from './components/pilot/PilotRoot';
import { DevControlPanel } from './components/debug/DevControlPanel';

import { ParticipantRole } from './types';

function App() {
  const [role, setRole] = useState<ParticipantRole | 'selection'>('selection');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const roleParam = params.get('role') as ParticipantRole;
    
    if (modeParam === 'board') setRole('BOARD');
    else if (roleParam) setRole(roleParam);
  }, []);

  if (role === 'selection') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forest-gradient gap-8 p-4">
        <h1 className="text-4xl font-bold text-sasquach-gold tracking-widest uppercase">Sasquach V1.0</h1>
        <p className="text-stone-400 italic">"The Why drives the How"</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => window.location.search = '?mode=board'}
            className="w-full px-8 py-4 bg-forest-800 border border-forest-700 rounded-lg hover:border-sasquach-gold transition-all"
          >
            <span className="block text-xl font-bold">BOARD</span>
            <span className="text-xs text-stone-500 uppercase">Proyector</span>
          </button>
          
          <div className="h-px bg-stone-800 my-4" />
          
          <p className="text-center text-xs text-stone-500 uppercase tracking-widest">Select Pilot Role</p>
          {(['DOCTOR', 'NURSE', 'KINE', 'INFECTOLOGIST', 'ADMIN'] as ParticipantRole[]).map(r => (
            <button 
              key={r}
              onClick={() => window.location.search = `?role=${r}`}
              className="w-full px-6 py-3 bg-stone-900 border border-stone-800 rounded-lg hover:border-sasquach-gold transition-all text-sm font-bold"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <RitualProvider role={role}>
      <DevControlPanel />
      {role === 'BOARD' ? <BoardRoot /> : <PilotRoot />}
    </RitualProvider>
  );
}

export default App;

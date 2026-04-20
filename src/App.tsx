import { useEffect, useState, useMemo } from 'react';
import { RitualProvider } from './context/RitualContext';
import { BoardRoot } from './components/board/BoardRoot';
import { PilotRoot } from './components/pilot/PilotRoot';
import { DevControlPanel } from './components/debug/DevControlPanel';
import { navigateTo } from './utils/navigation';

import { ParticipantRole } from './types';

const VALID_ROLES: ParticipantRole[] = ['BOARD', 'DOCTOR', 'NURSE', 'KINE', 'INFECTOLOGIST', 'ADMIN'];

const getUrlParams = () => new URLSearchParams(window.location.search);

const getRoleFromUrl = (params: URLSearchParams): ParticipantRole | 'selection' => {
  const modeParam = params.get('mode');
  const roleParam = params.get('role');
  
  if (modeParam === 'board') return 'BOARD';
  if (roleParam) {
    const normalizedRole = roleParam.toUpperCase() as ParticipantRole;
    return VALID_ROLES.includes(normalizedRole) ? normalizedRole : 'selection';
  }
  return 'selection';
};

const getRoomFromUrl = (params: URLSearchParams): string => {
  return params.get('room')?.trim()?.toUpperCase() || 'LOBBY';
};

function App() {
  const params = useMemo(() => getUrlParams(), []);
  const room = useMemo(() => getRoomFromUrl(params), [params]);
  const initialRole = useMemo(() => getRoleFromUrl(params), [params]);
  
  const [role, setRole] = useState<ParticipantRole | 'selection'>(initialRole);

  useEffect(() => {
    const handleUrlChange = () => {
      const newParams = getUrlParams();
      const urlRole = getRoleFromUrl(newParams);
      if (urlRole !== 'selection') {
        setRole(urlRole);
      }
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  if (role === 'selection') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forest-gradient gap-8 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-sasquach-gold tracking-widest uppercase">Sasquach V1.0</h1>
          <p className="text-stone-500 italic mt-2 text-sm">
            Sala: <span className="text-sasquach-gold font-mono">{room}</span>
          </p>
        </div>
        <p className="text-stone-400 italic">"The Why drives the How"</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => navigateTo({ mode: 'board' })}
            className="w-full px-8 py-4 bg-forest-800 border border-forest-700 rounded-lg hover:border-sasquach-gold transition-all"
          >
            <span className="block text-xl font-bold">BOARD</span>
            <span className="text-xs text-stone-500 uppercase">Proyector</span>
          </button>
          
          <div className="h-px bg-stone-800 my-4" />
          
          <p className="text-center text-xs text-stone-500 uppercase tracking-widest">Select Pilot Role</p>
          {VALID_ROLES.filter(r => r !== 'BOARD').map(r => (
            <button 
              key={r}
              onClick={() => navigateTo({ role: r.toLowerCase() })}
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

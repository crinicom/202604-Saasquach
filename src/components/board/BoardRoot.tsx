import { useRitual } from '../../context/RitualContext';

export const BoardRoot = () => {
  const { state } = useRitual();

  return (
    <div className="min-h-screen bg-forest-gradient p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-stone-500 text-sm font-bold tracking-[0.3em] uppercase">The Mirror</h2>
          <h1 className="text-3xl text-sasquach-gold font-black italic">PHASE: {state.currentPhase}</h1>
        </div>
        <div className="text-right">
          <p className="text-stone-500 text-xs">ROOM ID</p>
          <p className="font-mono text-sasquach-gold opacity-50">{state.roomId}</p>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-8 aspect-video bg-forest-900/50 rounded-2xl border border-forest-700/30 flex items-center justify-center relative overflow-hidden">
           {/* Visual Narrative Space */}
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
           <div className="text-center z-10">
              <div className="w-32 h-32 bg-sasquach-gold/10 rounded-full blur-3xl absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
              <p className="text-stone-600 animate-pulse uppercase tracking-[0.5em]">Waiting for Pilot Sync...</p>
           </div>
        </section>

        <section className="col-span-12 lg:col-span-4 space-y-6">
           <div className="p-6 bg-stone-900/50 rounded-xl border border-stone-800">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Intel Colectiva</h3>
              <div className="space-y-4">
                 <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sasquach-gold w-1/4 transition-all duration-1000"></div>
                 </div>
                 <p className="text-stone-400 text-sm italic">"Why summary will appear here..."</p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

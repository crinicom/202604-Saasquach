'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-forest-void flex flex-col items-center justify-center p-24 text-center">
      <div className="space-y-8 max-w-2xl">
        <header className="space-y-4">
          <span className="text-sasquach-gold text-xs font-black tracking-[0.5em] uppercase">Sasquach Engine V2</span>
          <h1 className="text-6xl text-white">The Mirror & The Pilot</h1>
          <p className="text-stone-400 font-serif italic text-xl">
            "Transformando el consenso silencioso en inteligencia colectiva visual."
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link href="/board" className="group p-8 glass-panel rounded-[2rem] border border-white/5 hover:border-sasquach-gold/30 transition-all duration-500">
            <h3 className="text-stone-100 group-hover:text-sasquach-gold transition-colors">The Board</h3>
            <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest font-sans not-italic font-bold">Proyector / Espejo</p>
          </Link>
          
          <Link href="/pilot" className="group p-8 glass-panel rounded-[2rem] border border-white/5 hover:border-sasquach-gold/30 transition-all duration-500">
            <h3 className="text-stone-100 group-hover:text-sasquach-gold transition-colors">The Pilot</h3>
            <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest font-sans not-italic font-bold">Móvil / Ejecución</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

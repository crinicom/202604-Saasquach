'use client';

import { RitualProvider } from '@/lib/context/RitualContext';
import { PilotView } from '@/components/pilot/PilotView';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PilotContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role')?.toUpperCase() || 'DOCTOR';
  
  return (
    <RitualProvider role={role as any}>
      <main className="min-h-screen bg-forest-void text-stone-200">
        <PilotView />
      </main>
    </RitualProvider>
  );
}

export default function PilotPage() {
  return (
    <Suspense fallback={<div>Cargando Ritual...</div>}>
      <PilotContent />
    </Suspense>
  );
}

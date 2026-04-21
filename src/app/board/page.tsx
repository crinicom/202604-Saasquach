'use client';

import { RitualProvider } from '@/lib/context/RitualContext';
import { BoardRoot } from '@/components/board/BoardRoot';

export default function BoardPage() {
  return (
    <RitualProvider role="BOARD">
      <BoardRoot />
    </RitualProvider>
  );
}

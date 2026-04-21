-- Tabla para sincronizar WHY responses
CREATE TABLE IF NOT EXISTS public.why_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  weight DECIMAL DEFAULT 0.5,
  status TEXT DEFAULT 'active',
  reinforced_by JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para filtrado rápido
CREATE INDEX IF NOT EXISTS idx_why_entries_ritual ON public.why_entries(ritual_id);

-- Habilitar Realtime
ALTER TABLE public.why_entries ENABLE REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.why_entries;

-- Tabla para sincronizar area heads (silos)
CREATE TABLE IF NOT EXISTS public.area_heads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,  -- nombre del área
  success_metric TEXT,
  weight DECIMAL DEFAULT 0.5,
  status TEXT DEFAULT 'active',
  voted_by JSONB DEFAULT '[]',
  merged_from TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para filtrado rápido
CREATE INDEX IF NOT EXISTS idx_area_heads_ritual ON public.area_heads(ritual_id);

-- Habilitar Realtime
ALTER TABLE public.area_heads ENABLE REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.area_heads;

-- Tabla para sincronizar estado completo (para recovery)
CREATE TABLE IF NOT EXISTS public.room_state (
  ritual_id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  current_phase TEXT DEFAULT 'WHY',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime
ALTER TABLE public.room_state ENABLE REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_state;
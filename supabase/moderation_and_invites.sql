-- ==============================================================================
-- DailySet - Moderación y Arranque Social (Supabase / PostgreSQL)
-- ==============================================================================
-- Este script crea las tablas de moderación (bloqueos y reportes) con RLS.
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
-- 2. Abre el SQL Editor y crea una New Query.
-- 3. Pega este archivo y ejecútalo (Cmd+Enter / Ctrl+Enter).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA 'social_bloqueos' (Bloqueo de usuarios)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_bloqueos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bloqueador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  bloqueado_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT no_self_block CHECK (bloqueador_id <> bloqueado_id),
  CONSTRAINT unique_block_pair UNIQUE (bloqueador_id, bloqueado_id)
);

COMMENT ON TABLE public.social_bloqueos IS 'Registra a qué usuarios ha bloqueado cada usuario.';
COMMENT ON COLUMN public.social_bloqueos.bloqueador_id IS 'ID del usuario que ejecuta el bloqueo.';
COMMENT ON COLUMN public.social_bloqueos.bloqueado_id IS 'ID del usuario bloqueado.';

CREATE INDEX IF NOT EXISTS idx_social_bloqueos_bloqueador ON public.social_bloqueos (bloqueador_id);
CREATE INDEX IF NOT EXISTS idx_social_bloqueos_bloqueado ON public.social_bloqueos (bloqueado_id);

-- ------------------------------------------------------------------------------
-- 2. TABLA 'social_reportes' (Reportes de moderación de usuarios y rutinas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reportador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'rutina')),
  reportado_usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  rutina_id BIGINT REFERENCES public.rutinas(id) ON DELETE SET NULL,
  motivo TEXT NOT NULL,
  descripcion TEXT DEFAULT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisado', 'desestimado', 'accion_tomada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.social_reportes IS 'Reportes enviados por usuarios sobre perfiles o rutinas inapropiadas.';

CREATE INDEX IF NOT EXISTS idx_social_reportes_reportado ON public.social_reportes (reportado_usuario_id);
CREATE INDEX IF NOT EXISTS idx_social_reportes_estado ON public.social_reportes (estado);

-- ------------------------------------------------------------------------------
-- 3. HABILITAR RLS (Row Level Security)
-- ------------------------------------------------------------------------------
ALTER TABLE public.social_bloqueos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reportes ENABLE ROW LEVEL SECURITY;

-- 3.1. Políticas para 'social_bloqueos'
DROP POLICY IF EXISTS "Usuarios ven sus propios bloqueos" ON public.social_bloqueos;
CREATE POLICY "Usuarios ven sus propios bloqueos"
  ON public.social_bloqueos
  FOR SELECT
  TO authenticated
  USING (bloqueador_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden bloquear" ON public.social_bloqueos;
CREATE POLICY "Usuarios pueden bloquear"
  ON public.social_bloqueos
  FOR INSERT
  TO authenticated
  WITH CHECK (bloqueador_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden desbloquear" ON public.social_bloqueos;
CREATE POLICY "Usuarios pueden desbloquear"
  ON public.social_bloqueos
  FOR DELETE
  TO authenticated
  USING (bloqueador_id = auth.uid());

-- 3.2. Políticas para 'social_reportes'
DROP POLICY IF EXISTS "Usuarios ven sus reportes enviados" ON public.social_reportes;
CREATE POLICY "Usuarios ven sus reportes enviados"
  ON public.social_reportes
  FOR SELECT
  TO authenticated
  USING (reportador_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden crear reportes" ON public.social_reportes;
CREATE POLICY "Usuarios pueden crear reportes"
  ON public.social_reportes
  FOR INSERT
  TO authenticated
  WITH CHECK (reportador_id = auth.uid());

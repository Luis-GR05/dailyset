-- ==============================================================================
-- DailySet - Notificaciones y Reacciones Sociales (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. TABLA 'social_reacciones' (Likes a rutinas públicas)
CREATE TABLE IF NOT EXISTS public.social_reacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rutina_id BIGINT NOT NULL REFERENCES public.rutinas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_rutina_usuario_reaccion UNIQUE (rutina_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_social_reacciones_rutina ON public.social_reacciones (rutina_id);
CREATE INDEX IF NOT EXISTS idx_social_reacciones_usuario ON public.social_reacciones (usuario_id);

-- 2. TABLA 'notificaciones' (Bandeja de notificaciones del usuario)
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nivel', 'racha', 'record', 'entrenamiento', 'sistema', 'seguidor', 'reaccion', 'clonacion')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  enlace TEXT DEFAULT NULL,
  actor_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  rutina_id BIGINT REFERENCES public.rutinas(id) ON DELETE SET NULL,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones (usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON public.notificaciones (usuario_id, leida);

-- 3. SEGURIDAD RLS
ALTER TABLE public.social_reacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para 'social_reacciones'
DROP POLICY IF EXISTS "Lectura publica de reacciones" ON public.social_reacciones;
CREATE POLICY "Lectura publica de reacciones"
  ON public.social_reacciones
  FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Usuarios gestionan sus propias reacciones" ON public.social_reacciones;
CREATE POLICY "Usuarios gestionan sus propias reacciones"
  ON public.social_reacciones
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Políticas para 'notificaciones'
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios ven sus propias notificaciones"
  ON public.notificaciones
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
  ON public.notificaciones
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden eliminar sus notificaciones"
  ON public.notificaciones
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Insercion de notificaciones autenticadas" ON public.notificaciones;
CREATE POLICY "Insercion de notificaciones autenticadas"
  ON public.notificaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

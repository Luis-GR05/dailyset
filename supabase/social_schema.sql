-- ==============================================================================
-- DailySet - Módulo Social (Supabase / PostgreSQL)
-- ==============================================================================
-- Este script configura la infraestructura de base de datos para la funcionalidad
-- social: perfiles públicos, privacidad de rutinas y sistema de seguidores.
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
-- 2. Abre el "SQL Editor" y crea una "New query".
-- 3. Pega todo el contenido de este archivo y presiona "Run" (Cmd+Enter / Ctrl+Enter).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIÓN DE TABLA 'perfiles'
-- ------------------------------------------------------------------------------
-- Añade campos necesarios para el perfil público sin alterar datos existentes.

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS es_publico BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.perfiles.bio IS 'Biografía corta o descripción del usuario para su perfil social.';
COMMENT ON COLUMN public.perfiles.es_publico IS 'Indica si el perfil del usuario es visible en el buscador y feed social.';

-- Asegurar que nombre_usuario sea único e insensible a mayúsculas en perfiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfiles_nombre_usuario_unique 
  ON public.perfiles (LOWER(nombre_usuario));

-- ------------------------------------------------------------------------------
-- 2. EXTENSIÓN DE TABLA 'rutinas'
-- ------------------------------------------------------------------------------
-- Añade el control de privacidad por defecto (is_public = FALSE).
-- Todas las rutinas existentes permanecerán privadas por defecto.

ALTER TABLE public.rutinas
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.rutinas.is_public IS 'Control de privacidad: FALSE = privada (por defecto), TRUE = pública para la comunidad.';

-- Índice para acelerar la carga del feed de rutinas públicas
CREATE INDEX IF NOT EXISTS idx_rutinas_is_public_created_at
  ON public.rutinas (is_public, created_at DESC)
  WHERE is_public = TRUE;

-- ------------------------------------------------------------------------------
-- 3. TABLA 'follows' (Relaciones de seguimiento entre usuarios)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

COMMENT ON TABLE public.follows IS 'Registra las relaciones de seguimiento entre usuarios (quién sigue a quién).';
COMMENT ON COLUMN public.follows.follower_id IS 'ID del usuario que realiza la acción de seguir.';
COMMENT ON COLUMN public.follows.following_id IS 'ID del usuario que es seguido.';

-- Índices para búsquedas bidireccionales rápidas
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows (following_id);

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ------------------------------------------------------------------------------

-- 4.1. Habilitar RLS en las tablas afectadas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4.2. Políticas para 'perfiles'
-- ------------------------------------------------------------------------------

-- Permitir a usuarios autenticados leer perfiles que sean públicos o el suyo propio
DROP POLICY IF EXISTS "Perfiles públicos son visibles por usuarios autenticados" ON public.perfiles;
CREATE POLICY "Perfiles públicos son visibles por usuarios autenticados"
  ON public.perfiles
  FOR SELECT
  TO authenticated
  USING (
    es_publico = TRUE 
    OR auth.uid() = id
  );

-- Permitir a cada usuario modificar únicamente su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.perfiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4.3. Políticas para 'rutinas'
-- ------------------------------------------------------------------------------

-- Lectura: un usuario puede ver sus propias rutinas (privadas o públicas)
-- O cualquier rutina ajena que esté marcada como pública (is_public = TRUE)
DROP POLICY IF EXISTS "Usuarios ven sus rutinas o rutinas públicas" ON public.rutinas;
CREATE POLICY "Usuarios ven sus rutinas o rutinas públicas"
  ON public.rutinas
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR is_public = TRUE
  );

-- Inserción: cada usuario solo puede crear rutinas asociadas a su propio usuario_id
DROP POLICY IF EXISTS "Usuarios pueden crear sus propias rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden crear sus propias rutinas"
  ON public.rutinas
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Modificación: cada usuario solo puede modificar sus propias rutinas
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden actualizar sus propias rutinas"
  ON public.rutinas
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Eliminación: cada usuario solo puede borrar sus propias rutinas
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden eliminar sus propias rutinas"
  ON public.rutinas
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4.4. Políticas para 'ejercicios_rutina' (asociación de ejercicios)
-- ------------------------------------------------------------------------------
-- Aseguramos que si una rutina es pública, sus ejercicios asociados también puedan leerse

ALTER TABLE public.ejercicios_rutina ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de ejercicios de rutinas visibles" ON public.ejercicios_rutina;
CREATE POLICY "Lectura de ejercicios de rutinas visibles"
  ON public.ejercicios_rutina
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas r
      WHERE r.id = ejercicios_rutina.rutina_id
      AND (r.usuario_id = auth.uid() OR r.is_public = TRUE)
    )
  );

DROP POLICY IF EXISTS "Gestionar ejercicios de sus propias rutinas" ON public.ejercicios_rutina;
CREATE POLICY "Gestionar ejercicios de sus propias rutinas"
  ON public.ejercicios_rutina
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas r
      WHERE r.id = ejercicios_rutina.rutina_id
      AND r.usuario_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.5. Políticas para 'follows'
-- ------------------------------------------------------------------------------

-- Lectura: cualquier usuario autenticado puede consultar quién sigue a quién
DROP POLICY IF EXISTS "Cualquiera autenticado puede ver follows" ON public.follows;
CREATE POLICY "Cualquiera autenticado puede ver follows"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Inserción: un usuario solo puede registrarse a sí mismo como seguidor (follower_id)
DROP POLICY IF EXISTS "Usuarios pueden seguir a otros" ON public.follows;
CREATE POLICY "Usuarios pueden seguir a otros"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

-- Eliminación: un usuario solo puede dejar de seguir si es el seguidor
DROP POLICY IF EXISTS "Usuarios pueden dejar de seguir" ON public.follows;
CREATE POLICY "Usuarios pueden dejar de seguir"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- ==============================================================================
-- ¡Listo! Esquema social y RLS configurados con seguridad por defecto.
-- ==============================================================================

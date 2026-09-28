-- ==============================================================================
-- DailySet - Esquema Maestro Unificado de Base de Datos (Supabase / PostgreSQL)
-- ==============================================================================
-- Este archivo consolida todo el modelo relacional de la aplicación:
-- 1. Perfiles de usuario y preferencias extendidas (incluyendo bio y visibilidad)
-- 2. Catálogo completo de ejercicios (compatible con free-exercise-db)
-- 3. Rutinas personales y públicas de la comunidad (con is_public)
-- 4. Asociación ordenada de ejercicios a rutinas (ejercicios_rutina)
-- 5. Sesiones de entrenamiento registradas
-- 6. Series detalladas (sets, kg, reps, completada)
-- 7. Red social y comunidad (follows / seguidores)
-- 8. Moderación (social_bloqueos y social_reportes)
-- 9. Reacciones a rutinas (social_reacciones / likes)
-- 10. Sistema de notificaciones en tiempo real
-- 11. Triggers automáticos, vistas analíticas y funciones PL/pgSQL
-- 12. Políticas de Seguridad RLS (Row Level Security) exhaustivas
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger genérico para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLA 'perfiles' (Extiende auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT NULL,
  nivel_entrenamiento TEXT DEFAULT 'principiante',
  es_publico BOOLEAN NOT NULL DEFAULT TRUE,
  preferencias JSONB DEFAULT '{"unidadesKg": true, "notificaciones": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.perfiles IS 'Datos de perfil extendidos para cada usuario autenticado.';
COMMENT ON COLUMN public.perfiles.bio IS 'Biografía corta o lema deportivo para el perfil público.';
COMMENT ON COLUMN public.perfiles.es_publico IS 'Indica si el perfil es visible en búsquedas y feed social.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_perfiles_nombre_usuario_lower ON public.perfiles (LOWER(nombre_usuario));

DROP TRIGGER IF EXISTS update_perfiles_updated_at ON public.perfiles;
CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. TABLA 'ejercicios' (Catálogo técnico completo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ejercicios (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  instrucciones TEXT,
  instrucciones_pasos TEXT[],
  grupo_muscular TEXT,
  musculos_primarios TEXT[],
  musculos_secundarios TEXT[],
  equipamiento TEXT,
  mecanica TEXT,
  fuerza TEXT,
  categoria_ejercicio TEXT,
  dificultad TEXT CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')),
  url_video TEXT,
  url_imagen TEXT,
  imagen_inicio TEXT,
  imagen_final TEXT,
  es_publico BOOLEAN DEFAULT false,
  creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ejercicios IS 'Catálogo técnico de ejercicios públicos o personalizados por usuarios.';

CREATE INDEX IF NOT EXISTS idx_ejercicios_creado_por ON public.ejercicios(creado_por);
CREATE INDEX IF NOT EXISTS idx_ejercicios_es_publico ON public.ejercicios(es_publico);
CREATE INDEX IF NOT EXISTS idx_ejercicios_categoria_ej ON public.ejercicios(categoria_ejercicio);
CREATE INDEX IF NOT EXISTS idx_ejercicios_external_id ON public.ejercicios(external_id);

DROP TRIGGER IF EXISTS update_ejercicios_updated_at ON public.ejercicios;
CREATE TRIGGER update_ejercicios_updated_at
  BEFORE UPDATE ON public.ejercicios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. TABLA 'rutinas' (Rutinas de entrenamiento personales y públicas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rutinas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  etiquetas TEXT[] DEFAULT '{}',
  dias_semana SMALLINT[] DEFAULT '{}',
  duracion_estimada_minutos INTEGER CHECK (duracion_estimada_minutos > 0),
  es_plantilla BOOLEAN DEFAULT false,
  esta_activa BOOLEAN DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.rutinas IS 'Rutinas de entrenamiento creadas por usuarios o publicadas en la comunidad.';
COMMENT ON COLUMN public.rutinas.is_public IS 'Control de privacidad: FALSE = privada, TRUE = pública en feed social.';

CREATE INDEX IF NOT EXISTS idx_rutinas_usuario_id ON public.rutinas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_esta_activa ON public.rutinas(esta_activa);
CREATE INDEX IF NOT EXISTS idx_rutinas_is_public_created ON public.rutinas (is_public, created_at DESC) WHERE is_public = TRUE;

DROP TRIGGER IF EXISTS update_rutinas_updated_at ON public.rutinas;
CREATE TRIGGER update_rutinas_updated_at
  BEFORE UPDATE ON public.rutinas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. TABLA 'ejercicios_rutina' (Asociación N:M ordenada)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ejercicios_rutina (
  id BIGSERIAL PRIMARY KEY,
  rutina_id BIGINT NOT NULL REFERENCES public.rutinas(id) ON DELETE CASCADE,
  ejercicio_id BIGINT NOT NULL REFERENCES public.ejercicios(id) ON DELETE CASCADE,
  indice_orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (rutina_id, ejercicio_id)
);

COMMENT ON TABLE public.ejercicios_rutina IS 'Asociación ordenada de ejercicios en una rutina.';

CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina_rutina_id ON public.ejercicios_rutina(rutina_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina_ejercicio_id ON public.ejercicios_rutina(ejercicio_id);

-- ------------------------------------------------------------------------------
-- 6. TABLA 'sesiones_entrenamiento'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sesiones_entrenamiento (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  rutina_id BIGINT REFERENCES public.rutinas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  duracion_minutos INTEGER CHECK (duracion_minutos >= 0),
  puntuacion SMALLINT CHECK (puntuacion >= 1 AND puntuacion <= 5),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.sesiones_entrenamiento IS 'Registro de entrenamientos finalizados por los atletas.';

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON public.sesiones_entrenamiento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON public.sesiones_entrenamiento(fecha);
CREATE INDEX IF NOT EXISTS idx_sesiones_rutina_id ON public.sesiones_entrenamiento(rutina_id);

DROP TRIGGER IF EXISTS update_sesiones_updated_at ON public.sesiones_entrenamiento;
CREATE TRIGGER update_sesiones_updated_at
  BEFORE UPDATE ON public.sesiones_entrenamiento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. TABLA 'series' (Sets individuales completados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.series (
  id BIGSERIAL PRIMARY KEY,
  sesion_id BIGINT NOT NULL REFERENCES public.sesiones_entrenamiento(id) ON DELETE CASCADE,
  ejercicio_id BIGINT NOT NULL REFERENCES public.ejercicios(id) ON DELETE RESTRICT,
  orden INTEGER NOT NULL,
  kg NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (kg >= 0),
  reps INTEGER NOT NULL DEFAULT 0 CHECK (reps >= 0),
  completada BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.series IS 'Series ejecutadas en cada sesión con carga en kilogramos y repeticiones.';

CREATE INDEX IF NOT EXISTS idx_series_sesion_id ON public.series(sesion_id);
CREATE INDEX IF NOT EXISTS idx_series_ejercicio_id ON public.series(ejercicio_id);

-- ------------------------------------------------------------------------------
-- 8. TABLA 'follows' (Seguidores en la comunidad)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

COMMENT ON TABLE public.follows IS 'Relaciones de seguimiento de la comunidad.';

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows (following_id);

-- ------------------------------------------------------------------------------
-- 9. TABLAS DE MODERACIÓN ('social_bloqueos' y 'social_reportes')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_bloqueos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bloqueador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  bloqueado_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT no_self_block CHECK (bloqueador_id <> bloqueado_id),
  CONSTRAINT unique_block_pair UNIQUE (bloqueador_id, bloqueado_id)
);

CREATE INDEX IF NOT EXISTS idx_social_bloqueos_bloqueador ON public.social_bloqueos (bloqueador_id);
CREATE INDEX IF NOT EXISTS idx_social_bloqueos_bloqueado ON public.social_bloqueos (bloqueado_id);

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

CREATE INDEX IF NOT EXISTS idx_social_reportes_reportado ON public.social_reportes (reportado_usuario_id);
CREATE INDEX IF NOT EXISTS idx_social_reportes_estado ON public.social_reportes (estado);

-- ------------------------------------------------------------------------------
-- 10. TABLA 'social_reacciones' (Likes en rutinas comunitarias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_reacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rutina_id BIGINT NOT NULL REFERENCES public.rutinas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_rutina_usuario_reaccion UNIQUE (rutina_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_social_reacciones_rutina ON public.social_reacciones (rutina_id);
CREATE INDEX IF NOT EXISTS idx_social_reacciones_usuario ON public.social_reacciones (usuario_id);

-- ------------------------------------------------------------------------------
-- 11. TABLA 'notificaciones'
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 12. HABILITAR ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_rutina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_bloqueos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 13. POLÍTICAS RLS
-- ------------------------------------------------------------------------------

-- Perfiles
DROP POLICY IF EXISTS "Lectura perfiles autenticados o publicos" ON public.perfiles;
CREATE POLICY "Lectura perfiles autenticados o publicos" ON public.perfiles
  FOR SELECT TO authenticated
  USING (es_publico = true OR auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios editan su propio perfil" ON public.perfiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios insertan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios insertan su propio perfil" ON public.perfiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios eliminan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios eliminan su propio perfil" ON public.perfiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Ejercicios
DROP POLICY IF EXISTS "Ver ejercicios publicos o propios" ON public.ejercicios;
CREATE POLICY "Ver ejercicios publicos o propios" ON public.ejercicios
  FOR SELECT
  USING (es_publico = true OR creado_por = auth.uid());

DROP POLICY IF EXISTS "Crear ejercicios propios" ON public.ejercicios;
CREATE POLICY "Crear ejercicios propios" ON public.ejercicios
  FOR INSERT TO authenticated
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "Actualizar ejercicios propios" ON public.ejercicios;
CREATE POLICY "Actualizar ejercicios propios" ON public.ejercicios
  FOR UPDATE TO authenticated
  USING (creado_por = auth.uid())
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "Eliminar ejercicios propios" ON public.ejercicios;
CREATE POLICY "Eliminar ejercicios propios" ON public.ejercicios
  FOR DELETE TO authenticated
  USING (creado_por = auth.uid());

-- Rutinas
DROP POLICY IF EXISTS "Ver rutinas propias o publicas" ON public.rutinas;
CREATE POLICY "Ver rutinas propias o publicas" ON public.rutinas
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR is_public = true);

DROP POLICY IF EXISTS "Crear rutinas propias" ON public.rutinas;
CREATE POLICY "Crear rutinas propias" ON public.rutinas
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Actualizar rutinas propias" ON public.rutinas;
CREATE POLICY "Actualizar rutinas propias" ON public.rutinas
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Eliminar rutinas propias" ON public.rutinas;
CREATE POLICY "Eliminar rutinas propias" ON public.rutinas
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- Ejercicios_Rutina
DROP POLICY IF EXISTS "Ver ejercicios de rutinas visibles" ON public.ejercicios_rutina;
CREATE POLICY "Ver ejercicios de rutinas visibles" ON public.ejercicios_rutina
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas r
      WHERE r.id = ejercicios_rutina.rutina_id
      AND (r.usuario_id = auth.uid() OR r.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Gestionar ejercicios de rutinas propias" ON public.ejercicios_rutina;
CREATE POLICY "Gestionar ejercicios de rutinas propias" ON public.ejercicios_rutina
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas r
      WHERE r.id = ejercicios_rutina.rutina_id
      AND r.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rutinas r
      WHERE r.id = ejercicios_rutina.rutina_id
      AND r.usuario_id = auth.uid()
    )
  );

-- Sesiones de entrenamiento
DROP POLICY IF EXISTS "Gestionar sesiones propias" ON public.sesiones_entrenamiento;
CREATE POLICY "Gestionar sesiones propias" ON public.sesiones_entrenamiento
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Series
DROP POLICY IF EXISTS "Gestionar series de sesiones propias" ON public.series;
CREATE POLICY "Gestionar series de sesiones propias" ON public.series
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento se
      WHERE se.id = series.sesion_id
      AND se.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento se
      WHERE se.id = series.sesion_id
      AND se.usuario_id = auth.uid()
    )
  );

-- Follows
DROP POLICY IF EXISTS "Lectura de follows autenticada" ON public.follows;
CREATE POLICY "Lectura de follows autenticada" ON public.follows
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios gestionan sus follows" ON public.follows;
CREATE POLICY "Usuarios gestionan sus follows" ON public.follows
  FOR ALL TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

-- Bloqueos y reportes
DROP POLICY IF EXISTS "Gestionar bloqueos propios" ON public.social_bloqueos;
CREATE POLICY "Gestionar bloqueos propios" ON public.social_bloqueos
  FOR ALL TO authenticated
  USING (bloqueador_id = auth.uid())
  WITH CHECK (bloqueador_id = auth.uid());

DROP POLICY IF EXISTS "Gestionar reportes propios" ON public.social_reportes;
CREATE POLICY "Gestionar reportes propios" ON public.social_reportes
  FOR ALL TO authenticated
  USING (reportador_id = auth.uid())
  WITH CHECK (reportador_id = auth.uid());

-- Reacciones
DROP POLICY IF EXISTS "Lectura publica de reacciones" ON public.social_reacciones;
CREATE POLICY "Lectura publica de reacciones" ON public.social_reacciones
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios gestionan sus reacciones" ON public.social_reacciones;
CREATE POLICY "Usuarios gestionan sus reacciones" ON public.social_reacciones
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Notificaciones
DROP POLICY IF EXISTS "Usuarios leen y gestionan sus notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios leen y gestionan sus notificaciones" ON public.notificaciones
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Insercion autorizada de notificaciones" ON public.notificaciones;
CREATE POLICY "Insercion autorizada de notificaciones" ON public.notificaciones
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 14. FUNCIONES Y VISTAS ANALÍTICAS
-- ------------------------------------------------------------------------------

-- Función para volumen total histórico acumulado
CREATE OR REPLACE FUNCTION public.get_volumen_total(usuario_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(s.kg * s.reps), 0) INTO total
  FROM public.series s
  JOIN public.sesiones_entrenamiento se ON s.sesion_id = se.id
  WHERE se.usuario_id = $1;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Vista mensual de sesiones
CREATE OR REPLACE VIEW public.vista_progreso_mensual AS
SELECT
  se.usuario_id,
  DATE_TRUNC('month', se.fecha) AS mes,
  COUNT(DISTINCT se.id) AS num_sesiones,
  SUM(se.duracion_minutos) AS total_minutos,
  COALESCE(SUM(s.kg * s.reps), 0) AS volumen_total_kg
FROM public.sesiones_entrenamiento se
LEFT JOIN public.series s ON s.sesion_id = se.id
GROUP BY se.usuario_id, DATE_TRUNC('month', se.fecha);

COMMENT ON VIEW public.vista_progreso_mensual IS 'Resumen mensual de entrenamientos por usuario.';

CREATE OR REPLACE FUNCTION public.obtener_progreso_mensual()
RETURNS TABLE (
  mes TIMESTAMP WITH TIME ZONE,
  num_sesiones BIGINT,
  total_minutos BIGINT,
  volumen_total_kg NUMERIC
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.mes,
    v.num_sesiones,
    v.total_minutos,
    v.volumen_total_kg
  FROM public.vista_progreso_mensual v
  WHERE v.usuario_id = auth.uid()
  ORDER BY v.mes DESC;
END;
$$;

-- ------------------------------------------------------------------------------
-- 15. DATOS BASE INICIALES (Ejercicios Públicos Semilla)
-- ------------------------------------------------------------------------------
INSERT INTO public.ejercicios (nombre, descripcion, grupo_muscular, dificultad, es_publico)
VALUES 
  ('Press de Banca', 'Press de banca con barra', 'Pecho', 'intermedio', true),
  ('Sentadilla', 'Sentadilla libre con barra', 'Piernas', 'intermedio', true),
  ('Peso Muerto', 'Peso muerto convencional', 'Espalda', 'avanzado', true)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16. CONTROL DE LÍMITES POR PLAN EN BASE DE DATOS
-- ------------------------------------------------------------------------------
-- Previene condiciones de carrera o inyecciones concurrentes que excedan el plan
CREATE OR REPLACE FUNCTION public.check_limite_rutinas_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_count INT;
  v_max INT;
  v_prefs JSONB;
BEGIN
  -- Obtener plan desde las preferencias del perfil
  SELECT preferencias INTO v_prefs FROM public.perfiles WHERE id = NEW.usuario_id;
  v_plan := COALESCE(v_prefs->>'plan', 'free');

  IF v_plan = 'ultra' THEN
    RETURN NEW;
  ELSIF v_plan = 'pro' THEN
    v_max := 12;
  ELSE
    v_max := 4;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.rutinas WHERE usuario_id = NEW.usuario_id;
  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Límite de rutinas alcanzado para el plan % (máximo % rutinas)', v_plan, v_max;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_limite_rutinas ON public.rutinas;
CREATE TRIGGER trigger_check_limite_rutinas
BEFORE INSERT ON public.rutinas
FOR EACH ROW
EXECUTE FUNCTION public.check_limite_rutinas_plan();
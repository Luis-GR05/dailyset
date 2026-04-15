-- =====================================================
-- 1. EXTENSIÓN PARA UUID (si no está habilitada)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLA DE PERFILES (extiende auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  avatar_url TEXT,
  nivel_entrenamiento TEXT DEFAULT 'principiante',
  preferencias JSONB DEFAULT '{"unidadesKg": true, "notificaciones": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.perfiles IS 'Datos de perfil extendidos para cada usuario autenticado.';
COMMENT ON COLUMN public.perfiles.preferencias IS 'Preferencias del usuario en formato JSON: unidadesKg, notificaciones, etc.';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_perfiles_updated_at ON public.perfiles;
CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 3. TABLA DE EJERCICIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ejercicios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  instrucciones TEXT,
  grupo_muscular TEXT,
  dificultad TEXT CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')),
  url_video TEXT,
  url_imagen TEXT,
  es_publico BOOLEAN DEFAULT false,
  creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ejercicios IS 'Ejercicios disponibles (públicos o creados por usuarios).';
COMMENT ON COLUMN public.ejercicios.creado_por IS 'Usuario que creó el ejercicio. NULL si es un ejercicio del sistema.';

CREATE INDEX IF NOT EXISTS idx_ejercicios_creado_por ON public.ejercicios(creado_por);
CREATE INDEX IF NOT EXISTS idx_ejercicios_es_publico ON public.ejercicios(es_publico);

DROP TRIGGER IF EXISTS update_ejercicios_updated_at ON public.ejercicios;
CREATE TRIGGER update_ejercicios_updated_at
  BEFORE UPDATE ON public.ejercicios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. TABLA DE RUTINAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rutinas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  etiquetas TEXT[] DEFAULT '{}',
  dias_semana SMALLINT[] DEFAULT '{}', -- 1=Lunes...7=Domingo
  duracion_estimada_minutos INTEGER CHECK (duracion_estimada_minutos > 0),
  es_plantilla BOOLEAN DEFAULT false,
  esta_activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.rutinas IS 'Rutinas de entrenamiento creadas por los usuarios.';
COMMENT ON COLUMN public.rutinas.etiquetas IS 'Array de etiquetas para categorizar la rutina (ej: fuerza, hipertrofia).';
COMMENT ON COLUMN public.rutinas.dias_semana IS 'Días de la semana asignados (1=Lunes...7=Domingo).';

CREATE INDEX IF NOT EXISTS idx_rutinas_usuario_id ON public.rutinas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_esta_activa ON public.rutinas(esta_activa);

DROP TRIGGER IF EXISTS update_rutinas_updated_at ON public.rutinas;
CREATE TRIGGER update_rutinas_updated_at
  BEFORE UPDATE ON public.rutinas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. TABLA DE RELACIÓN RUTINAS <-> EJERCICIOS (con orden)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ejercicios_rutina (
  id BIGSERIAL PRIMARY KEY,
  rutina_id BIGINT NOT NULL REFERENCES public.rutinas(id) ON DELETE CASCADE,
  ejercicio_id BIGINT NOT NULL REFERENCES public.ejercicios(id) ON DELETE CASCADE,
  indice_orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (rutina_id, ejercicio_id)
);

COMMENT ON TABLE public.ejercicios_rutina IS 'Asociación de ejercicios a una rutina con un orden específico.';

CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina_rutina_id ON public.ejercicios_rutina(rutina_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina_ejercicio_id ON public.ejercicios_rutina(ejercicio_id);

-- =====================================================
-- 6. TABLA DE SESIONES DE ENTRENAMIENTO
-- =====================================================
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

COMMENT ON TABLE public.sesiones_entrenamiento IS 'Registro de sesiones de entrenamiento realizadas.';
COMMENT ON COLUMN public.sesiones_entrenamiento.rutina_id IS 'Rutina utilizada (opcional).';

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON public.sesiones_entrenamiento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON public.sesiones_entrenamiento(fecha);
CREATE INDEX IF NOT EXISTS idx_sesiones_rutina_id ON public.sesiones_entrenamiento(rutina_id);

DROP TRIGGER IF EXISTS update_sesiones_updated_at ON public.sesiones_entrenamiento;
CREATE TRIGGER update_sesiones_updated_at
  BEFORE UPDATE ON public.sesiones_entrenamiento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. TABLA DE SERIES (detalle de ejercicios en una sesión)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.series (
  id BIGSERIAL PRIMARY KEY,
  sesion_id BIGINT NOT NULL REFERENCES public.sesiones_entrenamiento(id) ON DELETE CASCADE,
  ejercicio_id BIGINT NOT NULL REFERENCES public.ejercicios(id) ON DELETE RESTRICT,
  orden INTEGER NOT NULL,
  kg NUMERIC(6,2) CHECK (kg >= 0),
  reps INTEGER CHECK (reps >= 0),
  completada BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.series IS 'Series individuales realizadas en una sesión para cada ejercicio.';

CREATE INDEX IF NOT EXISTS idx_series_sesion_id ON public.series(sesion_id);
CREATE INDEX IF NOT EXISTS idx_series_ejercicio_id ON public.series(ejercicio_id);

-- =====================================================
-- 8. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas públicas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_rutina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- -------------------------------
-- Políticas para perfiles
-- -------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserción durante registro" ON public.perfiles;
CREATE POLICY "Permitir inserción durante registro"
  ON public.perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -------------------------------
-- Políticas para ejercicios
-- -------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver ejercicios públicos" ON public.ejercicios;
CREATE POLICY "Cualquiera puede ver ejercicios públicos"
  ON public.ejercicios FOR SELECT
  USING (es_publico = true);

DROP POLICY IF EXISTS "Usuarios pueden ver sus ejercicios privados" ON public.ejercicios;
CREATE POLICY "Usuarios pueden ver sus ejercicios privados"
  ON public.ejercicios FOR SELECT
  USING (auth.uid() = creado_por);

DROP POLICY IF EXISTS "Usuarios pueden crear ejercicios" ON public.ejercicios;
CREATE POLICY "Usuarios pueden crear ejercicios"
  ON public.ejercicios FOR INSERT
  WITH CHECK (auth.uid() = creado_por);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus ejercicios" ON public.ejercicios;
CREATE POLICY "Usuarios pueden actualizar sus ejercicios"
  ON public.ejercicios FOR UPDATE
  USING (auth.uid() = creado_por)
  WITH CHECK (auth.uid() = creado_por);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus ejercicios" ON public.ejercicios;
CREATE POLICY "Usuarios pueden eliminar sus ejercicios"
  ON public.ejercicios FOR DELETE
  USING (auth.uid() = creado_por);

-- -------------------------------
-- Políticas para rutinas
-- -------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden ver sus rutinas"
  ON public.rutinas FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden crear rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden crear rutinas"
  ON public.rutinas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden actualizar sus rutinas"
  ON public.rutinas FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus rutinas" ON public.rutinas;
CREATE POLICY "Usuarios pueden eliminar sus rutinas"
  ON public.rutinas FOR DELETE
  USING (auth.uid() = usuario_id);

-- -------------------------------
-- Políticas para ejercicios_rutina
-- -------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver ejercicios de sus rutinas" ON public.ejercicios_rutina;
CREATE POLICY "Usuarios pueden ver ejercicios de sus rutinas"
  ON public.ejercicios_rutina FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas
      WHERE rutinas.id = ejercicios_rutina.rutina_id
      AND rutinas.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden agregar ejercicios a sus rutinas" ON public.ejercicios_rutina;
CREATE POLICY "Usuarios pueden agregar ejercicios a sus rutinas"
  ON public.ejercicios_rutina FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rutinas
      WHERE rutinas.id = ejercicios_rutina.rutina_id
      AND rutinas.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden eliminar ejercicios de sus rutinas" ON public.ejercicios_rutina;
CREATE POLICY "Usuarios pueden eliminar ejercicios de sus rutinas"
  ON public.ejercicios_rutina FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.rutinas
      WHERE rutinas.id = ejercicios_rutina.rutina_id
      AND rutinas.usuario_id = auth.uid()
    )
  );

-- -------------------------------
-- Políticas para sesiones_entrenamiento
-- -------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus sesiones" ON public.sesiones_entrenamiento;
CREATE POLICY "Usuarios pueden ver sus sesiones"
  ON public.sesiones_entrenamiento FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden crear sesiones" ON public.sesiones_entrenamiento;
CREATE POLICY "Usuarios pueden crear sesiones"
  ON public.sesiones_entrenamiento FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus sesiones" ON public.sesiones_entrenamiento;
CREATE POLICY "Usuarios pueden actualizar sus sesiones"
  ON public.sesiones_entrenamiento FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus sesiones" ON public.sesiones_entrenamiento;
CREATE POLICY "Usuarios pueden eliminar sus sesiones"
  ON public.sesiones_entrenamiento FOR DELETE
  USING (auth.uid() = usuario_id);

-- -------------------------------
-- Políticas para series
-- -------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus series" ON public.series;
CREATE POLICY "Usuarios pueden ver sus series"
  ON public.series FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento
      WHERE sesiones_entrenamiento.id = series.sesion_id
      AND sesiones_entrenamiento.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden crear series en sus sesiones" ON public.series;
CREATE POLICY "Usuarios pueden crear series en sus sesiones"
  ON public.series FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento
      WHERE sesiones_entrenamiento.id = series.sesion_id
      AND sesiones_entrenamiento.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus series" ON public.series;
CREATE POLICY "Usuarios pueden actualizar sus series"
  ON public.series FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento
      WHERE sesiones_entrenamiento.id = series.sesion_id
      AND sesiones_entrenamiento.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento
      WHERE sesiones_entrenamiento.id = series.sesion_id
      AND sesiones_entrenamiento.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus series" ON public.series;
CREATE POLICY "Usuarios pueden eliminar sus series"
  ON public.series FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_entrenamiento
      WHERE sesiones_entrenamiento.id = series.sesion_id
      AND sesiones_entrenamiento.usuario_id = auth.uid()
    )
  );

-- =====================================================
-- 9. FUNCIÓN PARA OBTENER EL VOLUMEN TOTAL DE UN USUARIO
-- =====================================================
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

-- =====================================================
-- 10. VISTA PARA RESUMEN DE PROGRESO MENSUAL
-- =====================================================
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

COMMENT ON VIEW public.vista_progreso_mensual IS 'Resumen mensual de entrenamientos por usuario: sesiones, tiempo y volumen.';

-- Función segura para que el usuario vea solo su progreso
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

COMMENT ON FUNCTION public.obtener_progreso_mensual() IS 'Obtiene el progreso mensual del usuario autenticado de forma segura.';

INSERT INTO public.ejercicios (nombre, descripcion, grupo_muscular, dificultad, es_publico)
VALUES 
  ('Press de Banca', 'Press de banca con barra', 'Pecho', 'intermedio', true),
  ('Sentadilla', 'Sentadilla libre con barra', 'Piernas', 'intermedio', true),
  ('Peso Muerto', 'Peso muerto convencional', 'Espalda', 'avanzado', true);
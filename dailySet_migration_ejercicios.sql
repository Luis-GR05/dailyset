-- =====================================================
-- MIGRACIÓN: Ampliar tabla ejercicios para free-exercise-db
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

ALTER TABLE public.ejercicios
  ADD COLUMN IF NOT EXISTS external_id           TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS musculos_primarios     TEXT[],
  ADD COLUMN IF NOT EXISTS musculos_secundarios   TEXT[],
  ADD COLUMN IF NOT EXISTS equipamiento          TEXT,
  ADD COLUMN IF NOT EXISTS mecanica              TEXT,
  ADD COLUMN IF NOT EXISTS fuerza                TEXT,
  ADD COLUMN IF NOT EXISTS categoria_ejercicio   TEXT,
  ADD COLUMN IF NOT EXISTS instrucciones_pasos   TEXT[],
  ADD COLUMN IF NOT EXISTS imagen_inicio         TEXT,
  ADD COLUMN IF NOT EXISTS imagen_final          TEXT;

-- Índice para búsqueda por músculos
CREATE INDEX IF NOT EXISTS idx_ejercicios_categoria_ej ON public.ejercicios(categoria_ejercicio);
CREATE INDEX IF NOT EXISTS idx_ejercicios_external_id  ON public.ejercicios(external_id);

-- Actualizar la política RLS para que ejercicios públicos del sistema sean visibles sin auth
-- (el seed los inserta con es_publico = true, creado_por = null)
DROP POLICY IF EXISTS "Sistema ejercicios publicos" ON public.ejercicios;
CREATE POLICY "Sistema ejercicios publicos" ON public.ejercicios
  FOR SELECT
  USING (es_publico = true AND creado_por IS NULL);

COMMENT ON COLUMN public.ejercicios.external_id         IS 'ID del ejercicio en free-exercise-db (p.ej. Barbell_Squat)';
COMMENT ON COLUMN public.ejercicios.musculos_primarios   IS 'Músculos principales trabajados';
COMMENT ON COLUMN public.ejercicios.musculos_secundarios IS 'Músculos secundarios trabajados';
COMMENT ON COLUMN public.ejercicios.equipamiento        IS 'Equipamiento necesario (barbell, dumbbell, body only, etc.)';
COMMENT ON COLUMN public.ejercicios.categoria_ejercicio IS 'Categoría (strength, stretching, plyometrics, strongman, etc.)';
COMMENT ON COLUMN public.ejercicios.instrucciones_pasos IS 'Pasos de ejecución numerados';
COMMENT ON COLUMN public.ejercicios.imagen_inicio       IS 'Ruta relativa a /exercises/ID/0.jpg';
COMMENT ON COLUMN public.ejercicios.imagen_final        IS 'Ruta relativa a /exercises/ID/1.jpg';

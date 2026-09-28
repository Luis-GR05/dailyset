-- ==============================================================================
-- DailySet - Control de Límites de Rutinas por Plan en Supabase / PostgreSQL
-- ==============================================================================
-- Regla de negocio:
-- - Free: máximo 4 rutinas
-- - Pro: máximo 12 rutinas
-- - Ultra: ilimitadas
-- ==============================================================================

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

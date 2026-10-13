-- ==============================================================================
-- DailySet - Planes de suscripción seguros
-- ==============================================================================
-- PROBLEMA QUE RESUELVE
--   El plan (free/pro/ultra) se guardaba en perfiles.preferencias, una columna que
--   el propio usuario puede modificar (RLS "Usuarios editan su propio perfil"),
--   y además en localStorage. Cualquiera podía ponerse Ultra desde la consola.
--
-- SOLUCIÓN
--   1. Tabla public.suscripciones: el usuario sólo puede LEER su fila.
--      Únicamente el backend (webhook de Stripe con la service_role key) escribe.
--   2. Función public.plan_usuario(uid): fuente de verdad del plan en SQL.
--   3. Límites del plan Free/Pro aplicados en la base de datos (triggers):
--        - Rutinas: Free 4 · Pro 12 · Ultra ilimitadas
--        - Atletas seguidos: Free 20 · Pro/Ultra ilimitados
--   4. Limpieza: se eliminan de perfiles.preferencias las claves de facturación.
--
-- Ejecutar UNA vez en Supabase → SQL Editor. Es idempotente (se puede repetir).
-- ==============================================================================

-- 1. TABLA DE SUSCRIPCIONES -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suscripciones (
  usuario_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultra')),
  ciclo                   TEXT CHECK (ciclo IN ('mensual', 'anual')),
  estado                  TEXT,                -- estado de Stripe: active, trialing, past_due, canceled...
  fecha_renovacion        DATE,
  renovacion_automatica   BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.suscripciones IS
  'Plan de cada usuario. Sólo la escribe el webhook de Stripe (service_role). El usuario sólo puede leer la suya.';

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen su suscripcion" ON public.suscripciones;
CREATE POLICY "Usuarios leen su suscripcion" ON public.suscripciones
  FOR SELECT TO authenticated
  USING (auth.uid() = usuario_id);
-- Sin políticas de INSERT/UPDATE/DELETE: los clientes (anon/authenticated) no pueden escribir.
-- La service_role key ignora RLS, por eso el webhook sí puede.

REVOKE INSERT, UPDATE, DELETE ON public.suscripciones FROM anon, authenticated;

-- 2. PLAN EFECTIVO DE UN USUARIO -----------------------------------------------
-- Un plan de pago sólo cuenta si la suscripción está activa (o en prueba).
CREATE OR REPLACE FUNCTION public.plan_usuario(p_usuario UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT s.plan
       FROM public.suscripciones s
      WHERE s.usuario_id = p_usuario
        AND s.plan <> 'free'
        AND COALESCE(s.estado, 'active') IN ('active', 'trialing')
        AND (s.fecha_renovacion IS NULL OR s.fecha_renovacion >= CURRENT_DATE - 3)),
    'free'
  );
$$;

-- Sólo la usan los triggers (que se ejecutan como propietario): no se expone por la API.
REVOKE EXECUTE ON FUNCTION public.plan_usuario(UUID) FROM PUBLIC, anon, authenticated;

-- 3a. LÍMITE DE RUTINAS (sustituye a la versión de limite_rutinas_plan.sql) ------
CREATE OR REPLACE FUNCTION public.check_limite_rutinas_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT := public.plan_usuario(NEW.usuario_id);
  v_count INT;
  v_max   INT;
BEGIN
  IF v_plan = 'ultra' THEN
    RETURN NEW;
  ELSIF v_plan = 'pro' THEN
    v_max := 12;
  ELSE
    v_max := 4;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.rutinas WHERE usuario_id = NEW.usuario_id;
  IF v_count >= v_max THEN
    -- El mensaje empieza por un código estable que la web y la app reconocen.
    RAISE EXCEPTION 'LIMIT_RUTINAS_PLAN: límite de rutinas alcanzado para el plan % (máximo %)', v_plan, v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_limite_rutinas ON public.rutinas;
CREATE TRIGGER trigger_check_limite_rutinas
  BEFORE INSERT ON public.rutinas
  FOR EACH ROW EXECUTE FUNCTION public.check_limite_rutinas_plan();

-- 3b. LÍMITE DE ATLETAS SEGUIDOS -------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_limite_seguidos_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF public.plan_usuario(NEW.follower_id) IN ('pro', 'ultra') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.follows WHERE follower_id = NEW.follower_id;
  IF v_count >= 20 THEN
    RAISE EXCEPTION 'LIMIT_SEGUIDOS_FREE: el plan Free permite seguir a 20 atletas'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_limite_seguidos ON public.follows;
CREATE TRIGGER trigger_check_limite_seguidos
  BEFORE INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.check_limite_seguidos_plan();

-- 4. MIGRACIÓN DE DATOS EXISTENTES ----------------------------------------------
-- Sólo se conservan los planes que vienen de una suscripción real de Stripe
-- (tienen stripeSubscriptionId). Los planes "activados" con el pago simulado
-- vuelven a Free.
INSERT INTO public.suscripciones (
  usuario_id, plan, ciclo, estado, fecha_renovacion, renovacion_automatica,
  stripe_customer_id, stripe_subscription_id
)
SELECT
  p.id,
  CASE WHEN p.preferencias->>'plan' IN ('pro', 'ultra') THEN p.preferencias->>'plan' ELSE 'free' END,
  CASE WHEN p.preferencias->>'cicloFacturacion' IN ('mensual', 'anual') THEN p.preferencias->>'cicloFacturacion' END,
  'active',
  NULLIF(p.preferencias->>'fechaRenovacionPlan', '')::date,
  COALESCE((p.preferencias->>'renovacionAutomatica')::boolean, true),
  NULLIF(p.preferencias->>'stripeCustomerId', ''),
  NULLIF(p.preferencias->>'stripeSubscriptionId', '')
FROM public.perfiles p
WHERE NULLIF(p.preferencias->>'stripeSubscriptionId', '') IS NOT NULL
ON CONFLICT (usuario_id) DO NOTHING;

-- Limpiar las claves de facturación de preferencias (ya no se usan).
UPDATE public.perfiles
   SET preferencias = preferencias
       - 'plan' - 'cicloFacturacion' - 'fechaRenovacionPlan' - 'renovacionAutomatica'
       - 'stripeCustomerId' - 'stripeSubscriptionId'
 WHERE preferencias ?| ARRAY['plan', 'cicloFacturacion', 'fechaRenovacionPlan',
                             'renovacionAutomatica', 'stripeCustomerId', 'stripeSubscriptionId'];

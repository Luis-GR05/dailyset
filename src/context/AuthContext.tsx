import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { supabase, supabaseAdmin } from "../lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  nombre: string;
  nombre_usuario?: string;
  avatar_url?: string;
  unidadesKg: boolean;
  notificaciones: boolean;
  notificacionesEmail?: boolean;
  rango?: string;
  progreso?: number;
  totalSets?: string;
  racha?: number;
  pesoTotal?: string;
  // Datos físicos
  pesoKg?: number | null;
  alturaCm?: number | null;
  edad?: number | null;
  genero?: 'masculino' | 'femenino' | 'otro' | null;
  // Plan de suscripción
  plan?: 'free' | 'pro' | 'ultra';
  cicloFacturacion?: 'mensual' | 'anual';
  fechaRenovacionPlan?: string;
  renovacionAutomatica?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nombre: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  iniciarComoInvitado: () => void;
}

export const DEFAULT_GUEST_USER: User = {
  id: "invitado",
  email: "invitado@dailyset.app",
  nombre: "Atleta DailySet",
  nombre_usuario: "atleta_invitado",
  avatar_url: undefined,
  unidadesKg: true,
  notificaciones: false,
  notificacionesEmail: false,
  rango: "ATLETA",
  progreso: 25,
  totalSets: "24",
  racha: 3,
  pesoTotal: "1.250",
  pesoKg: 75,
  alturaCm: 178,
  edad: 26,
  genero: "masculino",
  nivelActividad: "moderado",
  objetivo: "ganar_musculo",
  plan: (localStorage.getItem("dailyset_user_plan") as 'free' | 'pro' | 'ultra') || "free",
  cicloFacturacion: (localStorage.getItem("dailyset_user_ciclo") as 'mensual' | 'anual') || "mensual",
  renovacionAutomatica: localStorage.getItem("dailyset_user_renovacion") !== 'false',
};

export function getGuestUser(): User {
  try {
    const raw = localStorage.getItem("dailyset_guest_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_GUEST_USER, ...parsed };
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_GUEST_USER;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_TIMEOUT_MS = 10000;
const AUTH_STORAGE_KEY = "dailyset-auth-token";
const PROFILE_REFRESH_MS = 5 * 60 * 1000;

function mapAuthUser(authUser: SupabaseUser): User {
  const metaUsername = authUser.user_metadata?.nombre_usuario as string | undefined;
  return {
    id: authUser.id,
    email: authUser.email || "",
    nombre:
      (authUser.user_metadata?.nombre_completo as string | undefined) ||
      metaUsername ||
      "Atleta",
    nombre_usuario: metaUsername || authUser.email?.split("@")[0] || "atleta",
    avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) || undefined,
    unidadesKg: true,
    notificaciones: false,
    rango: "ATLETA",
    progreso: 0,
    totalSets: "0",
    racha: 0,
    pesoTotal: "0",
    plan: (localStorage.getItem("dailyset_user_plan") as 'free' | 'pro' | 'ultra') || "free",
    cicloFacturacion: (localStorage.getItem("dailyset_user_ciclo") as 'mensual' | 'anual') || "mensual",
  };
}

async function fetchProfile(authUser: SupabaseUser): Promise<User | null> {
  try {
    // Obtener perfil desde la tabla 'perfiles'
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !data) {
      console.warn("Perfil no disponible, intentando sincronizar perfil:", error);
      try {
        const rawName =
          (authUser.user_metadata?.nombre_completo as string | undefined) ||
          (authUser.user_metadata?.nombre_usuario as string | undefined) ||
          authUser.email?.split("@")[0] ||
          "Atleta";
        const baseUsername = rawName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        const username = `${baseUsername}_${Date.now().toString().slice(-4)}`;

        const { data: created, error: insertError } = await supabase
          .from("perfiles")
          .insert({
            id: authUser.id,
            nombre_usuario: authUser.user_metadata?.nombre_usuario || username,
            nombre_completo: authUser.user_metadata?.nombre_completo || rawName,
          })
          .select("*")
          .single();

        if (!insertError && created) {
          const prefs = created.preferencias || {};
          return {
            id: created.id,
            email: authUser.email || "",
            nombre: created.nombre_completo || created.nombre_usuario || "",
            unidadesKg: prefs.unidadesKg ?? true,
            notificaciones: prefs.notificaciones ?? false,
            notificacionesEmail: prefs.notificacionesEmail ?? false,
            rango: created.nivel_entrenamiento?.toUpperCase() || "ATLETA",
            progreso: 0,
            totalSets: "0",
            racha: 0,
            pesoTotal: "0",
          };
        }
      } catch (autoCreateErr) {
        console.warn("No se pudo auto-crear perfil:", autoCreateErr);
      }

      return mapAuthUser(authUser);
    }

    const prefs = data.preferencias || {};

    return {
      id: data.id,
      email: authUser.email || "",
      nombre: data.nombre_completo || data.nombre_usuario || "",
      nombre_usuario: data.nombre_usuario || (authUser.user_metadata?.nombre_usuario as string | undefined) || "",
      avatar_url: (data.avatar_url as string | undefined) || (prefs.avatar_url as string | undefined) || (authUser.user_metadata?.avatar_url as string | undefined) || undefined,
      unidadesKg: prefs.unidadesKg ?? true,
      notificaciones: prefs.notificaciones ?? false,
      notificacionesEmail: prefs.notificacionesEmail ?? false,
      rango: data.nivel_entrenamiento?.toUpperCase() || "ATLETA",
      progreso: 0,
      totalSets: "0",
      racha: 0,
      pesoTotal: "0",
      // Datos físicos desde preferencias
      pesoKg: prefs.pesoKg ?? null,
      alturaCm: prefs.alturaCm ?? null,
      edad: prefs.edad ?? null,
      genero: prefs.genero ?? null,
      nivelActividad: prefs.nivelActividad ?? null,
      objetivo: prefs.objetivo ?? null,
      // Plan de suscripción
      plan: (prefs.plan as 'free' | 'pro' | 'ultra') || (localStorage.getItem("dailyset_user_plan") as 'free' | 'pro' | 'ultra') || 'free',
      cicloFacturacion: (prefs.cicloFacturacion as 'mensual' | 'anual') || (localStorage.getItem("dailyset_user_ciclo") as 'mensual' | 'anual') || 'mensual',
      fechaRenovacionPlan: prefs.fechaRenovacionPlan as string | undefined,
      renovacionAutomatica: (prefs.renovacionAutomatica as boolean | undefined) ?? (localStorage.getItem("dailyset_user_renovacion") !== 'false'),
    };
  } catch (err) {
    console.error("Error in fetchProfile:", err);
    return null;
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = AUTH_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Auth timeout exceeded")), timeoutMs);
    }),
  ]);
}

function getCachedAuthUser(): SupabaseUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { user?: SupabaseUser | null } | null;
    if (!parsed?.user?.id) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hydratedFromCache = false;

    // Evita bloqueo visual en F5: hidratar desde caché local si existe.
    const cachedUser = getCachedAuthUser();
    if (cachedUser) {
      hydratedFromCache = true;
      setUser(mapAuthUser(cachedUser));
      setLoading(false);
    }

    const watchdog = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS + 2000);

    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(supabase.auth.getSession());

        if (error) {
          throw error;
        }

        if (session?.user) {
          const profile = await withTimeout(fetchProfile(session.user));
          setUser(profile ?? mapAuthUser(session.user));
        } else {
          setUser(null);
        }
      } catch (error: unknown) {
        console.error("Error inicializando autenticación:", error);
        const err = error as { message?: string; code?: string; status?: number };
        const isInvalidToken =
          err?.message?.toLowerCase().includes("refresh token") ||
          err?.code === "invalid_grant" ||
          err?.status === 400;

        if (isInvalidToken) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          try {
            await supabase.auth.signOut();
          } catch {
            // ignore
          }
          setUser(null);
        } else if (!hydratedFromCache) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const profile = await withTimeout(fetchProfile(session.user));
          setUser(profile ?? mapAuthUser(session.user));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error en cambio de estado auth:", error);
        // Mantener sesión actual ante errores transitorios de sincronización auth.
        setUser((prev) => prev);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    const profileRefreshInterval = window.setInterval(async () => {
      if (!isMounted) return;
      setUser((currentUser) => currentUser);

      try {
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 5000);

        if (!session?.user) return;
        const profile = await withTimeout(fetchProfile(session.user), 5000);
        if (profile && isMounted) {
          setUser(profile);
        }
      } catch (error) {
        // Error transitorio: ignorar para no interrumpir la sesión activa.
        console.warn("No se pudo refrescar perfil en background:", error);
      }
    }, PROFILE_REFRESH_MS);

    return () => {
      isMounted = false;
      clearTimeout(watchdog);
      window.clearInterval(profileRefreshInterval);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (session?.user) {
      // Login optimista: permitir navegación inmediata y completar perfil en segundo plano.
      setUser(mapAuthUser(session.user));
      void withTimeout(fetchProfile(session.user))
        .then((profile) => {
          if (profile) {
            setUser(profile);
          }
        })
        .catch((profileError) => {
          console.warn("No se pudo completar perfil tras login:", profileError);
        });
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    // Generar nombre_usuario seguro
    const baseUsername = nombre
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const uniqueSuffix = Date.now().toString().slice(-6);
    const username = `${baseUsername}_${uniqueSuffix}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombre,
          nombre_usuario: username,
        },
      },
    });

    if (error) throw new Error(error.message);

    if (!data.user) throw new Error("No se pudo crear el usuario");

    // Confirmar email automáticamente usando admin API (sin requerir confirmación por correo)
    if (supabaseAdmin && !data.session) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        });
      } catch (adminErr) {
        console.warn("No se pudo auto-confirmar email:", adminErr);
      }
    }

    // Crear perfil en la tabla perfiles
    const { error: profileError } = await supabase.from("perfiles").insert({
      id: data.user.id,
      nombre_usuario: username,
      nombre_completo: nombre,
    });

    if (profileError && profileError.code !== '23505') {
      // 23505 = unique_violation (ya existe), lo ignoramos
      console.error("Error al crear perfil:", profileError);
    }

    // Si tenemos admin, iniciar sesión directamente después del registro
    if (supabaseAdmin && !data.session) {
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError && signInData.user) {
          const profile = await withTimeout(fetchProfile(signInData.user));
          setUser(profile ?? mapAuthUser(signInData.user));
          return { requiresEmailConfirmation: false };
        }
      } catch (signInErr) {
        console.warn("No se pudo iniciar sesión automáticamente:", signInErr);
      }
    }

    const requiresEmailConfirmation = !data.session;

    if (data.session) {
      const profile = await withTimeout(fetchProfile(data.user));
      setUser(profile ?? mapAuthUser(data.user));
    }

    return { requiresEmailConfirmation };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const iniciarComoInvitado = () => {
    const guest = getGuestUser();
    setUser(guest);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) throw new Error("No hay sesión activa");

    // Si es usuario invitado / offline, persistir en localStorage y actualizar estado reactivo
    if (user.id === "invitado") {
      const updated: User = {
        ...user,
        ...data,
      };
      setUser(updated);
      try {
        localStorage.setItem("dailyset_guest_profile", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return;
    }

    // Actualización optimista inmediata
    setUser(prev => prev ? { ...prev, ...data } : null);

    // Obtener el perfil actual para hacer merge de preferencias
    const { data: currentProfile, error: fetchError } = await supabase
      .from("perfiles")
      .select("preferencias")
      .eq("id", user.id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const currentPrefs = currentProfile?.preferencias || {};
    const newPrefs = {
      ...currentPrefs,
      unidadesKg: data.unidadesKg ?? currentPrefs.unidadesKg,
      notificaciones: data.notificaciones ?? currentPrefs.notificaciones,
      ...(data.notificacionesEmail !== undefined && { notificacionesEmail: data.notificacionesEmail }),
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
      // Datos físicos (solo actualizar si se pasan explícitamente)
      ...(data.pesoKg !== undefined && { pesoKg: data.pesoKg }),
      ...(data.alturaCm !== undefined && { alturaCm: data.alturaCm }),
      ...(data.edad !== undefined && { edad: data.edad }),
      ...(data.genero !== undefined && { genero: data.genero }),
      ...(data.nivelActividad !== undefined && { nivelActividad: data.nivelActividad }),
      ...(data.objetivo !== undefined && { objetivo: data.objetivo }),
      // Plan y ciclo
      ...(data.plan !== undefined && { plan: data.plan }),
      ...(data.cicloFacturacion !== undefined && { cicloFacturacion: data.cicloFacturacion }),
      ...(data.fechaRenovacionPlan !== undefined && { fechaRenovacionPlan: data.fechaRenovacionPlan }),
      ...(data.renovacionAutomatica !== undefined && { renovacionAutomatica: data.renovacionAutomatica }),
    };

    if (data.plan !== undefined) {
      localStorage.setItem("dailyset_user_plan", data.plan);
    }
    if (data.cicloFacturacion !== undefined) {
      localStorage.setItem("dailyset_user_ciclo", data.cicloFacturacion);
    }
    if (data.renovacionAutomatica !== undefined) {
      localStorage.setItem("dailyset_user_renovacion", String(data.renovacionAutomatica));
    }

    const dbData: Record<string, unknown> = {
      preferencias: newPrefs,
    };
    if (data.nombre !== undefined) {
      dbData.nombre_completo = data.nombre;
    }
    if (data.nombre_usuario !== undefined) {
      dbData.nombre_usuario = data.nombre_usuario.toLowerCase().trim();
    }
    if (data.avatar_url !== undefined) {
      dbData.avatar_url = data.avatar_url;
    }

    const { error: updateError } = await supabase
      .from("perfiles")
      .update(dbData)
      .eq("id", user.id);

    if (updateError) throw new Error(updateError.message);

    // Refrescar el perfil completo para tener consistencia
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      throw new Error("No se pudo refrescar la sesión");
    }

    const updatedProfile = await withTimeout(fetchProfile(authUser));
    setUser(updatedProfile ?? mapAuthUser(authUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, iniciarComoInvitado }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

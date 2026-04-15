import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  nombre: string;
  unidadesKg: boolean;
  notificaciones: boolean;
  rango?: string;
  progreso?: number;
  totalSets?: string;
  racha?: number;
  pesoTotal?: string;
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
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_TIMEOUT_MS = 10000;
const AUTH_STORAGE_KEY = "dailyset-auth-token";
const PROFILE_REFRESH_MS = 5 * 60 * 1000;

function mapAuthUser(authUser: SupabaseUser): User {
  return {
    id: authUser.id,
    email: authUser.email || "",
    nombre:
      (authUser.user_metadata?.nombre_completo as string | undefined) ||
      (authUser.user_metadata?.nombre_usuario as string | undefined) ||
      "Atleta",
    unidadesKg: true,
    notificaciones: false,
    rango: "ATLETA",
    progreso: 0,
    totalSets: "0",
    racha: 0,
    pesoTotal: "0",
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
      console.warn("Perfil no disponible, usando sesión auth:", error);
      return mapAuthUser(authUser);
    }

    const prefs = data.preferencias || {};

    return {
      id: data.id,
      email: authUser.email || "",
      nombre: data.nombre_completo || data.nombre_usuario || "",
      unidadesKg: prefs.unidadesKg ?? true,
      notificaciones: prefs.notificaciones ?? false,
      rango: data.nivel_entrenamiento?.toUpperCase() || "ATLETA",
      progreso: 0,
      totalSets: "0",
      racha: 0,
      pesoTotal: "0",
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
      } catch (error) {
        console.error("Error inicializando autenticación:", error);
        // Si hay sesión cacheada, no invalidar usuario por un timeout/fallo temporal de red.
        if (!hydratedFromCache) {
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

  // context/AuthContext.tsx (fragmento del método register)
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

    // Si el registro fue exitoso y tenemos un usuario, creamos el perfil manualmente
    if (data.user) {
      const { error: profileError } = await supabase.from("perfiles").insert({
        id: data.user.id,
        nombre_usuario: username,
        nombre_completo: nombre,
      });

      if (profileError) {
        console.error("Error al crear perfil:", profileError);
        // Podríamos intentar limpiar el usuario auth si falla, pero es opcional
      }
    }

    const requiresEmailConfirmation = !!data.user && !data.session;

    if (data.user && data.session) {
      const profile = await withTimeout(fetchProfile(data.user));
      setUser(profile ?? mapAuthUser(data.user));
    }

    return { requiresEmailConfirmation };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) throw new Error("No hay sesión activa");

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
    };

    const dbData: Record<string, unknown> = {
      preferencias: newPrefs,
    };
    if (data.nombre !== undefined) {
      dbData.nombre_completo = data.nombre;
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
      value={{ user, loading, login, register, logout, updateUser }}
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

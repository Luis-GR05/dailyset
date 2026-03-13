import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';


// ─── Tipos ────────────────────────────────────────────────────────────────────
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
  register: (email: string, password: string, nombre: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  try {
    // ✅ SOLUCIÓN: Obtener el email del session del usuario autenticado
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching profile:', error);
      return null;
    }

    const prefs = data.preferencias || {};

    return {
      id: data.id,
      email: session?.user?.email || '',
      nombre: data.nombre_completo || data.nombre_usuario || '',
      unidadesKg: prefs.unidadesKg !== undefined ? prefs.unidadesKg : true,
      notificaciones: prefs.notificaciones !== undefined ? prefs.notificaciones : false,
      rango: data.nivel_entrenamiento ? data.nivel_entrenamiento.toUpperCase() : 'ATLETA',
      progreso: 0,
      totalSets: '0',
      racha: 0,
      pesoTotal: '0',
    };
  } catch (err) {
    console.error('Error in fetchProfile:', err);
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombre,
          nombre_usuario: nombre.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000),
        }
      }
    });

    if (error) throw new Error(error.message);

    // Si hay confirmación de email, session es null — el trigger ya crea el perfil
    // No intentamos fetchProfile aquí porque puede no haber sesión todavía
    const requiresEmailConfirmation = !!data.user && !data.session;

    if (data.user && data.session) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile);
    }

    return { requiresEmailConfirmation };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) throw new Error('No hay sesión activa');

    try {
      const dbData: Record<string, unknown> = {};
      if (data.nombre !== undefined) dbData.nombre_completo = data.nombre;

      // Las preferencias van en el JSON de preferencias
      const prefsActuales = { unidadesKg: user.unidadesKg, notificaciones: user.notificaciones };
      if (data.unidadesKg !== undefined) prefsActuales.unidadesKg = !!data.unidadesKg;
      if (data.notificaciones !== undefined) prefsActuales.notificaciones = !!data.notificaciones;
      dbData.preferencias = prefsActuales;

      const { error } = await supabase
        .from('perfiles')
        .update(dbData)
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      setUser(prev => prev ? { ...prev, ...data } : prev);
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
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
  register: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email ?? '',
    nombre: data.nombre ?? '',
    unidadesKg: data.unidades_kg ?? true,
    notificaciones: data.notificaciones ?? false,
    rango: data.rango ?? 'ATLETA',
    progreso: data.progreso ?? 0,
    totalSets: data.total_sets ?? '0',
    racha: data.racha ?? 0,
    pesoTotal: data.peso_total ?? '0',
  };
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
    const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        nombre: nombre.toUpperCase(),
        unidades_kg: true,
        notificaciones: false,
        rango: 'ATLETA',
        progreso: 0,
        total_sets: '0',
        racha: 0,
        peso_total: '0',
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) throw new Error('No hay sesión activa');

    const dbData: Record<string, unknown> = {};
    if (data.nombre !== undefined) dbData.nombre = data.nombre;
    if (data.unidadesKg !== undefined) dbData.unidades_kg = data.unidadesKg;
    if (data.notificaciones !== undefined) dbData.notificaciones = data.notificaciones;

    const { error } = await supabase
      .from('profiles')
      .update(dbData)
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    setUser(prev => prev ? { ...prev, ...data } : prev);
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

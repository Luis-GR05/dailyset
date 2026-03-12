import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Perfil {
  id: string;
  nombre_usuario: string;
  nombre_completo: string | null;
  url_avatar: string | null;
  nivel_entrenamiento: string | null;
}

interface AuthContextType {
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signOut: () => Promise<void>;
  recargarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  signOut: async () => {},
  recargarPerfil: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfil = async (usuario: User) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, url_avatar, nivel_entrenamiento')
      .eq('id', usuario.id)
      .single();

    if (data) {
      setPerfil(data);
    } else if (error?.code === 'PGRST116') {
      // No existe la fila (usuario registrado antes del trigger) — la creamos
      const meta = usuario.user_metadata ?? {};
      const { data: nuevo } = await supabase
        .from('perfiles')
        .insert({
          id: usuario.id,
          nombre_usuario: meta.nombre_usuario || usuario.email?.split('@')[0] || 'usuario',
          nombre_completo: meta.nombre_completo || null,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
        })
        .select('id, nombre_usuario, nombre_completo, url_avatar, nivel_entrenamiento')
        .single();
      setPerfil(nuevo ?? null);
    } else {
      setPerfil(null);
    }
  };

  const recargarPerfil = async () => {
    if (user) await cargarPerfil(user);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user);
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  };

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signOut, recargarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

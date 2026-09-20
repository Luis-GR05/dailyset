// src/types/social.ts
// Tipos e interfaces TypeScript para el módulo Social de DailySet

export interface PerfilPublico {
  id: string;
  nombre_usuario: string;
  nombre_completo: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  nivel_entrenamiento?: string | null;
  es_publico?: boolean;
  seguidoresCount?: number;
  siguiendoCount?: number;
  rutinasCount?: number;
  esSeguido?: boolean;
}

export interface EjercicioSimple {
  id: number;
  nombre: string;
  grupo?: string;
}

export interface RutinaPublica {
  id: number;
  usuario_id: string;
  nombre: string;
  categoria: string;
  duracion_estimada_minutos: number;
  is_public: boolean;
  created_at?: string;
  perfil?: PerfilPublico;
  ejercicios?: EjercicioSimple[];
  ejerciciosCount: number;
  ejerciciosIds?: number[];
}

export interface FollowRelationship {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type FeedFilterType = 'todos' | 'siguiendo';

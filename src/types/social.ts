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
  esBloqueado?: boolean;
  tipoSugerencia?: 'popular' | 'creador_activo' | 'nuevo' | 'recomendado';
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
  likesCount?: number;
  esLikeada?: boolean;
}

export interface FollowRelationship {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type FeedFilterType = 'todos' | 'siguiendo';

export interface BloqueoUsuario {
  id?: string;
  bloqueador_id: string;
  bloqueado_id: string;
  created_at?: string;
  perfilBloqueado?: PerfilPublico;
}

export type MotivoReporte =
  | 'spam'
  | 'acoso'
  | 'contenido_inapropiado'
  | 'suplantacion'
  | 'nombre_ofensivo'
  | 'otro';

export interface ReporteContenido {
  id?: string;
  reportador_id: string;
  tipo: 'usuario' | 'rutina';
  reportado_usuario_id: string;
  rutina_id?: number | null;
  motivo: MotivoReporte;
  descripcion?: string;
  created_at?: string;
}

export interface ReaccionRutina {
  id?: string;
  rutina_id: number;
  usuario_id: string;
  created_at?: string;
}

export type TipoNotificacion =
  | 'nivel'
  | 'racha'
  | 'record'
  | 'entrenamiento'
  | 'sistema'
  | 'seguidor'
  | 'reaccion'
  | 'clonacion';

export interface NotificacionItem {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  tiempo: string;
  timestamp: number;
  leida: boolean;
  enlace?: string;
  actorId?: string;
  actorNombre?: string;
  actorAvatar?: string | null;
  rutinaId?: number;
}



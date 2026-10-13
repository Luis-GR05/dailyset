// Datos COMPARTIDOS web/app (se copian a dailyset-app con scripts/sincronizar-web.mjs).
import type { MotivoReporte } from '../types/social';

export const MOTIVOS_REPORTE: { id: MotivoReporte; labelEs: string; labelEn: string; descEs: string; descEn: string }[] = [
  {
    id: 'spam',
    labelEs: 'Spam o publicidad no deseada',
    labelEn: 'Spam or unwanted advertising',
    descEs: 'Promoción masiva, enlaces engañosos o autopromoción repetitiva.',
    descEn: 'Mass promotion, deceptive links, or repetitive self-promotion.',
  },
  {
    id: 'acoso',
    labelEs: 'Acoso o incitación al odio',
    labelEn: 'Harassment or hate speech',
    descEs: 'Insultos directos, intimidación, hostigamiento o discriminación.',
    descEn: 'Direct insults, intimidation, harassment, or discrimination.',
  },
  {
    id: 'contenido_inapropiado',
    labelEs: 'Contenido inapropiado o explícito',
    labelEn: 'Inappropriate or explicit content',
    descEs: 'Material no apto para la comunidad o que viola normas de convivencia.',
    descEn: 'Unsuitable material for the community or community guideline violations.',
  },
  {
    id: 'suplantacion',
    labelEs: 'Suplantación de identidad',
    labelEn: 'Impersonation or fake account',
    descEs: 'Se hace pasar por otra persona, atleta, entrenador o entidad.',
    descEn: 'Pretending to be another person, athlete, coach, or entity.',
  },
  {
    id: 'nombre_ofensivo',
    labelEs: 'Nombre o título ofensivo',
    labelEn: 'Offensive name or title',
    descEs: 'El nombre de usuario o el título de la rutina contiene términos ofensivos.',
    descEn: 'The username or routine title contains offensive wording.',
  },
  {
    id: 'otro',
    labelEs: 'Otro motivo',
    labelEn: 'Other reason',
    descEs: 'Cualquier otra infracción no contemplada en los puntos anteriores.',
    descEn: 'Any other violation not listed above.',
  },
];

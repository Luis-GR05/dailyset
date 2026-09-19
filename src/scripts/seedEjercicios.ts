/**
 * Seed script: importa los 1.323 ejercicios con GIFs animados de ExerciseGymGifsDB en Supabase.
 * 
 * Repositorio: https://github.com/JahelCuadrado/ExerciseGymGifsDB
 * CDN jsDelivr: https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0
 *
 * Uso:
 *   npx tsx src/scripts/seedEjercicios.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env manualmente sin dependencias extra
const envPath = resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan las variables de entorno de Supabase (SUPABASE_URL y SUPABASE_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ExerciseRaw {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  bodyPart: string;
  equipment: string;
  category: string;
  secondaryMuscles: string[];
  instructions: string[];
  file: string;
  gifUrl: string;
}

const BODY_PART_MAP: Record<string, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  arms: 'Brazos',
  legs: 'Piernas',
  shoulders: 'Hombros',
  core: 'Core',
  cardio: 'Cardio',
};

function mapDifficulty(category: string, equipment: string): 'principiante' | 'intermedio' | 'avanzado' {
  if (category === 'stretching' || equipment === 'bodyweight' || equipment === 'band') {
    return 'principiante';
  }
  if (category === 'plyometrics' || equipment === 'barbell' || equipment === 'kettlebell') {
    return 'avanzado';
  }
  return 'intermedio';
}

function mapRow(ex: ExerciseRaw) {
  const steps = Array.isArray(ex.instructions) ? ex.instructions : [];
  const grupo = BODY_PART_MAP[ex.bodyPart?.toLowerCase()] || ex.bodyPart || 'General';

  return {
    external_id:           ex.id,
    nombre:                ex.name,
    descripcion:           steps.join(' '),
    instrucciones:         steps.join('\n'),
    instrucciones_pasos:   steps,
    grupo_muscular:        grupo,
    musculos_primarios:    ex.muscle ? [ex.muscle] : [],
    musculos_secundarios:  ex.secondaryMuscles || [],
    dificultad:            mapDifficulty(ex.category, ex.equipment),
    equipamiento:          ex.equipment || null,
    categoria_ejercicio:   ex.category || 'strength',
    imagen_inicio:         ex.gifUrl,
    imagen_final:          ex.gifUrl,
    url_imagen:            ex.gifUrl,
    url_video:             ex.gifUrl,
    es_publico:            true,
    creado_por:            null,
  };
}

async function main() {
  console.log('🚀 Descargando ejercicios desde ExerciseGymGifsDB (API en español)...');
  const response = await fetch(
    'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/es/exercises.json'
  );

  if (!response.ok) {
    throw new Error(`Error al conectar con ExerciseGymGifsDB: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { count: number; exercises: ExerciseRaw[] };
  const rawList = data.exercises || [];
  console.log(`✅ ${rawList.length} ejercicios descargados con éxito.`);

  console.log('🧹 Limpiando ejercicios públicos anteriores...');
  const { error: deleteError } = await supabase
    .from('ejercicios')
    .delete()
    .is('creado_por', null);

  if (deleteError) {
    console.warn('⚠️ Nota al limpiar tabla ejercicios:', deleteError.message);
  } else {
    console.log('✔ Ejercicios anteriores eliminados.');
  }

  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  console.log(`📦 Insertando ${rawList.length} ejercicios en lotes de ${BATCH}...`);

  for (let i = 0; i < rawList.length; i += BATCH) {
    const batch = rawList.slice(i, i + BATCH).map(mapRow);

    const { error } = await supabase.from('ejercicios').insert(batch);

    if (error) {
      console.error(`❌ Error en lote ${Math.floor(i / BATCH) + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`\r   ✔ ${inserted}/${rawList.length} ejercicios insertados...`);
    }
  }

  console.log(`\n\n🎉 Seed de ExerciseGymGifsDB completado: ${inserted} insertados, ${errors} errores.`);
}

main().catch((err) => {
  console.error('❌ Error fatal en el seed:', err);
  process.exit(1);
});

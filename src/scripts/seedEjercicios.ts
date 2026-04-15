/**
 * Seed script: importa los 873 ejercicios de free-exercise-db en Supabase.
 * 
 * Uso:
 *   npx tsx src/scripts/seedEjercicios.ts
 *
 * Requiere las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 * (o usa la service role key para evitar RLS).
 *
 * Es idempotente: usa upsert por external_id, así que ejecutarlo varias 
 * veces no duplica ejercicios.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Cargar .env
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY 
  ?? process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Tipos del dataset ────────────────────────────────────────────────────────
interface ExerciseRaw {
  name: string;
  force: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  id: string;
}

// ─── Mapeadores ───────────────────────────────────────────────────────────────
function mapLevel(level: string): 'principiante' | 'intermedio' | 'avanzado' {
  if (level === 'beginner')     return 'principiante';
  if (level === 'intermediate') return 'intermedio';
  return 'avanzado';
}

function mapRow(ex: ExerciseRaw) {
  return {
    external_id:           ex.id,
    nombre:                ex.name,
    descripcion:           ex.instructions.join(' '),
    instrucciones:         ex.instructions.join('\n'),
    instrucciones_pasos:   ex.instructions,
    grupo_muscular:        ex.primaryMuscles[0] ?? null,
    musculos_primarios:    ex.primaryMuscles,
    musculos_secundarios:  ex.secondaryMuscles,
    dificultad:            mapLevel(ex.level),
    equipamiento:          ex.equipment ?? null,
    mecanica:              ex.mechanic ?? null,
    fuerza:                ex.force ?? null,
    categoria_ejercicio:   ex.category,
    // Imágenes como paths relativos desde /public/exercises/
    imagen_inicio: ex.images[0] ? `/exercises/${ex.images[0]}` : null,
    imagen_final:  ex.images[1] ? `/exercises/${ex.images[1]}` : null,
    url_imagen:    ex.images[0] ? `/exercises/${ex.images[0]}` : null,
    es_publico:    true,
    creado_por:    null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const jsonPath = resolve(
    __dirname,
    '../../ejercicios/free-exercise-db/dist/exercises.json'
  );

  console.log(`📂 Leyendo ${jsonPath}`);
  const raw: ExerciseRaw[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`✅ ${raw.length} ejercicios leídos`);

  const BATCH = 50;
  let inserted = 0;
  let errors   = 0;

  for (let i = 0; i < raw.length; i += BATCH) {
    const batch = raw.slice(i, i + BATCH).map(mapRow);

    const { error } = await supabase
      .from('ejercicios')
      .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false });

    if (error) {
      console.error(`❌ Error en batch ${i / BATCH + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`   ✔ ${inserted}/${raw.length} insertados`);
    }
  }

  console.log(`\n🎉 Seed completado: ${inserted} OK, ${errors} errores`);
}

main().catch(console.error);

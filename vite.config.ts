import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

function formatSupabaseUrl(url: string): string {
  if (!url) return ''
  return url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables desde archivos .env
  const env = loadEnv(mode, process.cwd(), '')

  // Detecta variables con o sin prefijo VITE_, tanto de process.env (Vercel) como de archivos .env
  const rawUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    ''

  const supabaseUrl = formatSupabaseUrl(rawUrl)

  const supabaseAnonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_KEY ||
    ''
  ).trim()

  // La service_role key NUNCA debe llegar al navegador: sólo la usan las funciones de /api
  // (process.env en Vercel). Por eso no se define aquí ni se expone con envPrefix.

  return {
    plugins: [react(), tailwindcss()],
    // Sólo VITE_*: el prefijo SUPABASE_ expondría SUPABASE_SERVICE_KEY al cliente.
    envPrefix: ['VITE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})


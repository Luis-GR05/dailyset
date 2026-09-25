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

  const supabaseServiceKey = (
    process.env.VITE_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    env.VITE_SUPABASE_SERVICE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    ''
  ).trim()

  return {
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_', 'SUPABASE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_SUPABASE_SERVICE_KEY': JSON.stringify(supabaseServiceKey),
      'import.meta.env.SUPABASE_SERVICE_KEY': JSON.stringify(supabaseServiceKey),
    },
  }
})


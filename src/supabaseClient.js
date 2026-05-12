import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '')
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

/** True when .env looks usable (wrong/empty values often cause "Failed to fetch"). */
export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.length > 20

if (!isSupabaseConfigured) {
  console.warn(
    '[Pashmina2026] Set VITE_SUPABASE_URL (https://…supabase.co) and VITE_SUPABASE_ANON_KEY in .env, then restart npm run dev.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

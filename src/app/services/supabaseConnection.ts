import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment.development'

// Replace these with your actual Supabase URL and public anon key
const supabaseUrl = environment.SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = environment.SUPABASE_ANON_KEY || 'your-supabase-anon-key'

console.log('supabaseUrl', supabaseUrl)
console.log('supabaseAnonKey', supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

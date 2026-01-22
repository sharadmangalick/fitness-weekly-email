import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Client-side Supabase client (for use in 'use client' components)
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

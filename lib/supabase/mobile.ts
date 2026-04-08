import { createClient } from '@supabase/supabase-js'

// Mobile client: uses localStorage instead of cookies (no server required).
// Use this in client components when BUILD_TARGET=mobile.
export function createMobileClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(url, key, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Singleton for use across the mobile app
let _mobileClient: ReturnType<typeof createMobileClient> | null = null

export function getMobileClient() {
  if (!_mobileClient) _mobileClient = createMobileClient()
  return _mobileClient
}

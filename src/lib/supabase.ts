import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))?.[2]
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=${options?.path || '/'}; max-age=${options?.maxAge || 604800}; SameSite=${options?.sameSite || 'Lax'}`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=${options?.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
}
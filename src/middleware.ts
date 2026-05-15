import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_IP_RATE_LIMIT = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 100

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = ALLOWED_IP_RATE_LIMIT.get(ip)
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    ALLOWED_IP_RATE_LIMIT.set(ip, { count: 1, timestamp: now })
    return false
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  record.count++
  return false
}

export async function middleware(request: NextRequest) {
  const clientIP = getClientIP(request)
  
  if (isRateLimited(clientIP)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
        'X-RateLimit-Remaining': '0',
      },
    })
  }

  const requestPath = request.nextUrl.pathname
  
  if (requestPath.startsWith('/api/')) {
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return new NextResponse('Invalid Content-Type', { status: 415 })
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  if (pathname === '/dashboard/codigos') {
    const adminLogged = request.cookies.get('admin_logged')?.value === 'true'
    if (adminLogged) {
      return supabaseResponse
    }
  }

  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  supabaseResponse.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  supabaseResponse.headers.set('X-Download-Options', 'noopen')
  supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  supabaseResponse.headers.set('Pragma', 'no-cache')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:\\._\\._\\._\\.)|api/upload).*)',
  ],
}
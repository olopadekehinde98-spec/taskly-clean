import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/buyer', '/dashboard', '/admin', '/schedule', '/messages']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as never)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/buyer/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/schedule/:path*',
    '/messages/:path*',
  ],
}

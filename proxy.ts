import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PROTECTED = ["/buyer", "/dashboard", "/admin", "/messages", "/orders", "/schedule"]
const SELLER_ONLY = ["/dashboard", "/schedule"]
const ADMIN_ONLY = ["/admin"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options as never))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (user && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/buyer", request.url))
  }
  if (!user && PROTECTED.some(r => path.startsWith(r))) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }
  if (user) {
    const isSellerRoute = SELLER_ONLY.some(r => path.startsWith(r))
    const isAdminRoute = ADMIN_ONLY.some(r => path.startsWith(r))
    if (isSellerRoute || isAdminRoute) {
      const { data: profile } = await supabase.from("profiles").select("is_seller, is_admin").eq("id", user.id).single()
      if (isAdminRoute && !profile?.is_admin) return NextResponse.redirect(new URL("/buyer", request.url))
      if (isSellerRoute && !profile?.is_seller && !profile?.is_admin) return NextResponse.redirect(new URL("/start-selling", request.url))
    }
  }
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

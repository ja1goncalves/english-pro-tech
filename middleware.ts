import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/sign-up',
  '/favicon.ico',
  '/robots.txt',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes and Next internals and our internal API
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/frontend-api')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(process.env.EPT_COOKIE_NAME || 'ept.token')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api).*)'],
}

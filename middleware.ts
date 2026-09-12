import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect authenticated users from home to dashboard
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require auth
        const publicRoutes = [
          '/',
          '/signin',
          '/signup',
          '/auth/error',
          '/auth/verify',
          '/api/auth',
          '/products',
          '/solutions',
          '/developers',
          '/pricing',
          '/docs',
          '/cli',
          '/hosting',
          '/explore',
          '/start',
          '/privacy',
          '/terms',
          '/sitemap',
          '/robots',
        ]

        // Allow public routes without auth
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Require auth for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

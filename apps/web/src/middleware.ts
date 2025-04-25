import { updateSession } from '@/lib/utils/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES } from './lib/constants/routes';
import { isPublicRoute } from './lib/utils/isPublicRoute';

export async function middleware(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const pathname = request.nextUrl.pathname;
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const payloadToken = request.cookies.get('payload-token')?.value;
  const { response, user: sbUser } = await updateSession(request);

  // If the user is not authenticated and the pathname is not in the public routes,
  const isPublic = isPublicRoute(pathname, Object.values(PUBLIC_ROUTES));
  if (!payloadToken && !sbUser && (pathname === '/auth/verify-otp' || !isPublic)) {
    return NextResponse.redirect(new URL('/auth/sign-in', baseUrl));
  }

  // If the identities array is empty, it means the user is not verified yet
  // and we need to redirect them to the verify-otp page.
  if (payloadToken && !sbUser?.identities?.length && pathname !== '/auth/verify-otp') {
    return NextResponse.redirect(new URL('/auth/verify-otp', baseUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

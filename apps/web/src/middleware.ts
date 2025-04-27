import { updateSession } from '@/lib/utils/supabase/middleware';
import { isStartsWith } from '@lactalink/utilities/formatString';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_PAGES, PUBLIC_ROUTES, SEARCH_PARAMS_KEYS } from './lib/constants/routes';

export async function middleware(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const pathname = request.nextUrl.pathname;
  const redirect = request.nextUrl.searchParams.get(SEARCH_PARAMS_KEYS.REDIRECT) || pathname;

  const isPublicRoute = isStartsWith(pathname, PUBLIC_ROUTES);
  const isAuthPage = isStartsWith(pathname, AUTH_PAGES);
  const isHomePage = pathname === '/';

  // Temporary: Redirect to /admin since the website currently serves as an admin panel.
  // Remove this redirect when the public-facing web platform is implemented.
  if (isHomePage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const payloadToken = request.cookies.get('payload-token')?.value;
  const { response, user: sbUser } = await updateSession(request);
  const isAuthenticated = Boolean(payloadToken && sbUser);
  const isAuthenticatedViaOAuth = Boolean(sbUser);

  // If the user is not authenticated and the pathname is not in the
  // public route, homepage, and auth pages.
  if (!isAuthenticated && !isAuthenticatedViaOAuth && !isHomePage && !isPublicRoute) {
    const url = new URL('/auth/sign-in', baseUrl);
    url.searchParams.set(SEARCH_PARAMS_KEYS.REDIRECT, redirect);
    return NextResponse.redirect(url);
  }

  // If the identities array of supabase user is empty, it means the user is
  // not verified yet and we need to redirect them to the verify-otp page.
  if (payloadToken && !sbUser?.identities?.length && pathname !== '/auth/verify-otp') {
    const url = new URL('/auth/verify-otp', baseUrl);
    return NextResponse.redirect(url);
  }

  if ((isAuthenticated || isAuthenticatedViaOAuth) && isAuthPage) {
    return NextResponse.redirect(new URL('/', baseUrl));
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

import { isStartsWith } from '@lactalink/utilities/formatters';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/api/init/middleware';
import { AUTH_PAGES, PUBLIC_ROUTES, SEARCH_PARAMS_KEYS } from './lib/constants/routes';

export async function middleware(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const pathname = request.nextUrl.pathname;
  const redirect = request.nextUrl.searchParams.get(SEARCH_PARAMS_KEYS.REDIRECT) || pathname;

  const isPublicRoute = isStartsWith(pathname, PUBLIC_ROUTES);
  const isHomePage = pathname === '/';
  const isAdminLoginPage = pathname === '/admin/login';
  const isSignInPage = pathname === AUTH_PAGES.SIGN_IN;

  // Temporary: Redirect to /admin since the website currently serves as an admin panel.
  // Remove this redirect when the public-facing web platform is implemented.
  if (isHomePage) {
    return NextResponse.redirect(new URL('/admin', baseUrl));
  }

  // Redirect /admin/login to /auth/sign-in to unify the login experience.
  if (isAdminLoginPage) {
    return NextResponse.redirect(new URL('/auth/sign-in', baseUrl));
  }

  const { response, user } = await updateSession(request);

  // If the user is not authenticated and the pathname is not in the
  // public route, homepage, and auth pages.
  if (!user && !isHomePage && !isPublicRoute && !isSignInPage) {
    const url = new URL('/auth/sign-in', baseUrl);
    url.searchParams.set(SEARCH_PARAMS_KEYS.REDIRECT, redirect);
    return NextResponse.redirect(url);
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

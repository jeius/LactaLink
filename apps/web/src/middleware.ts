import { isStartsWith } from '@lactalink/utilities/formatters';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/api/init/middleware';
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

  const { response, user } = await updateSession(request);

  // If the user is not authenticated and the pathname is not in the
  // public route, homepage, and auth pages.
  if (!user && !isHomePage && !isPublicRoute) {
    const url = new URL('/auth/sign-in', baseUrl);
    url.searchParams.set(SEARCH_PARAMS_KEYS.REDIRECT, redirect);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
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

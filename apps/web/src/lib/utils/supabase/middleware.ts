import { SESSION_NAME } from '@/lib/constants';
import { PUBLIC_ROUTES } from '@/lib/constants/routes';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
        cookieOptions: {
          name: SESSION_NAME,
          httpOnly: true,
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If the identities array is empty, it means the user is not verified yet
    // and we need to redirect them to the verify-otp page.
    if (
      user &&
      !user.identities?.length &&
      !pathname.startsWith(PUBLIC_ROUTES.auth) &&
      !pathname.startsWith(PUBLIC_ROUTES.api) &&
      pathname !== '/admin/logout'
    ) {
      return NextResponse.redirect(new URL('/auth/verify-otp', request.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // // admin routes
    // if (request.nextUrl.pathname.startsWith('/admin') && error) {
    //   return NextResponse.redirect(new URL('/sign-in', request.url));
    // }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

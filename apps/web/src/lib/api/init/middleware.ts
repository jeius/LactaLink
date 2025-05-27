import { SESSION_NAME, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/constants';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    const { response, supabase } = createClient(request);

    // Let Supabase handle session automatically from cookies
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn('Session validation error:', error.message);
    }

    return { response, user };
  } catch (e) {
    console.error('Middleware error:', e);
    return {
      user: null,
      response: NextResponse.next({
        request: { headers: request.headers },
      }),
    };
  }
}

function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  });
  return { response, supabase };
}

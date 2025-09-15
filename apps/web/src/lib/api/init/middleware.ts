import { SESSION_NAME, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/constants';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    const { response, supabase } = createClient(request);

    // Let Supabase handle session automatically from cookies
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // If there is a user, we set the session variable for RLS
      await supabase.rpc('set_auth_uid', { uid: user.id });
    }

    return { response, user };
  } catch (_) {
    return {
      user: null,
      response: NextResponse.next({
        request: { headers: request.headers },
      }),
    };
  }
}

function createClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });

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

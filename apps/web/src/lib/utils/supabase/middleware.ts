import { SESSION_NAME } from '@/lib/constants';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '../extractToken';

export const updateSession = async (request: NextRequest) => {
  try {
    const { response, supabase } = createClient(request);

    const token = extractBearerToken(request.headers);

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    return { response, user };
  } catch (e) {
    return {
      user: null,
      response: NextResponse.next({
        request: {
          headers: request.headers,
        },
      }),
    };
  }
};

function createClient(request: NextRequest) {
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
  return { response, supabase };
}

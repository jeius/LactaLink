import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export const useCheckAuth = () => {
  const auth = useAuth();
  const { session, user, profile, isLoading, isFetching, isError } = auth;
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false); // Prevent infinite loop

  useEffect(() => {
    if (!isLoading && !isFetching && !hasRedirected.current && !isError) {
      if (!user && !session && !pathname.includes('/auth')) {
        console.log('No user found, redirecting to sign-in');
        hasRedirected.current = true; // Prevent further redirection
        if (router.canDismiss()) {
          router.dismissTo('/auth/sign-in');
        } else {
          router.replace('/auth/sign-in');
        }
      } else if (user && profile && pathname.includes('/setup-profile')) {
        console.log('Profile already set up, redirecting to home');
        hasRedirected.current = true; // Prevent further redirection
        if (router.canDismiss()) {
          router.dismissTo('/home');
        } else {
          router.replace('/home');
        }
      } else if (user && !profile && !pathname.includes('/setup-profile')) {
        console.log('User profile not set up, redirecting to setup-profile');
        hasRedirected.current = true; // Prevent further redirection
        if (router.canDismiss()) {
          router.dismissTo('/setup-profile');
        } else {
          router.replace('/setup-profile');
        }
      }
    }
  }, [user, profile, isLoading, session, isFetching, pathname, router, isError]);

  return auth;
};

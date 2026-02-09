import { RedirectSearchParams } from '@/lib/types/searchParams';
import { Href, usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * The type of navigation to perform when using the navigate function returned by the hook.
 * - `push`: Adds a new entry to the history stack (default).
 * - `replace`: Replaces the current entry in the history stack.
 */
type NavigationType = 'push' | 'replace';

/**
 * Hook that navigates to a given href and appends a redirect query parameter
 * with the current path as the value
 *
 * @returns A function that takes an href and navigates to it with redirect params
 *
 * @example
 * const navigate = useNavigateWithRedirect();
 * navigate("/login") // navigates to /login?redirect=/current-path using push
 * navigate("/login", 'replace') // navigates to /login?redirect=/current-path using replace
 */
export function useNavigateWithRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Navigates to the specified href while appending a redirect query parameter with the current path.
   * @param navigationType - Type of navigation: `push` or `replace` (default: `push`)
   */
  const navigate = useCallback(
    (href: Href, type: NavigationType = 'push') => {
      let finalHref: Href;
      const redirectParam: RedirectSearchParams = { redirect: pathname };

      if (typeof href === 'string') {
        finalHref = { pathname: href, params: redirectParam } as Href;
      } else {
        finalHref = {
          ...href,
          params: { ...href.params, ...redirectParam },
        } as Href;
      }

      if (type === 'replace') {
        router.replace(finalHref);
      } else {
        router.push(finalHref);
      }
    },
    [router, pathname]
  );

  return navigate;
}

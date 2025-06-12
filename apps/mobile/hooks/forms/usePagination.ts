import { usePathname, useRouter } from 'expo-router';

type SearchParams = Record<string, string | string[] | undefined>;

export function usePagination<T extends SearchParams = SearchParams>(
  routes: string[],
  searchParams?: T
) {
  const pathname = usePathname();
  const router = useRouter();

  const currentPageIndex = routes.findIndex((page) => pathname.includes(String(page)));
  const hasNextPage = currentPageIndex < routes.length - 1;
  const hasPrevPage = currentPageIndex > 0;

  const progress = ((currentPageIndex + 1) / routes.length) * 100;

  const enumPages = [...routes] as const;

  function handleNext() {
    if (hasNextPage) {
      const page = routes[currentPageIndex + 1] || '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push({ pathname: page as any, params: searchParams });
    }
  }

  function handleBack() {
    if (hasPrevPage && router.canDismiss()) {
      router.dismiss();
    }
  }

  return {
    pages: enumPages,
    pathname,
    searchParams,
    currentPageIndex,
    progress,
    nextPage: handleNext,
    prevPage: handleBack,
    hasNextPage,
    hasPrevPage,
  };
}

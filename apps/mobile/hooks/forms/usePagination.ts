import { Href, usePathname, useRouter } from 'expo-router';

export function usePagination<T extends string>(routes: T[]) {
  const pathname = usePathname();
  const router = useRouter();

  const currentPageIndex = routes.findIndex((page) => pathname.includes(String(page)));
  const hasNextPage = currentPageIndex < routes.length - 1;
  const hasPrevPage = currentPageIndex > 0;

  const progress = ((currentPageIndex + 1) / routes.length) * 100;

  const enumPages = [...routes] as const;

  function handleNext() {
    if (hasNextPage) {
      const page = routes[currentPageIndex + 1] as Href;
      router.push(page);
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
    currentPageIndex,
    progress,
    nextPage: handleNext,
    prevPage: handleBack,
    hasNextPage,
    hasPrevPage,
  };
}

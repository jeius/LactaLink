import { Href, usePathname, useRouter } from 'expo-router';

export function usePagination<T extends string>(pages: T[]) {
  const pathname = usePathname();
  const router = useRouter();

  const currentPageIndex = pages.findIndex((page) => pathname.includes(String(page)));
  const hasNextPage = currentPageIndex < pages.length - 1;
  const hasPrevPage = currentPageIndex > 0;

  const progress = ((currentPageIndex + 1) / pages.length) * 100;

  const enumPages = [...pages] as const;

  function handleNext() {
    if (hasNextPage) {
      const page = pages[currentPageIndex + 1] as Href;
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

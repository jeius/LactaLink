import { usePagination } from '@/hooks/forms';
import { useTutorialStore } from '@/lib/stores/tutorialStore';
import { DONATION_CREATE_ROUTES, DONATION_CREATE_STEPS } from '../lib/constants';
import { DonationCreateSteps } from '../lib/types';

export function useCreateDonationNavigator(currentStep: DonationCreateSteps) {
  const routes = DONATION_CREATE_ROUTES;
  const { nextPage, skipToPage, currentPageIndex, hasNextPage } = usePagination(routes);

  const { completed: tutorialDone } = useTutorialStore((s) => s.donation);
  const setDonationTutorialState = useTutorialStore((s) => s.setters.setDonationState);

  async function handleNext() {
    switch (currentStep) {
      case 'details': {
        if (!tutorialDone) {
          nextPage();
          return;
        }

        const verificationPage = DONATION_CREATE_STEPS['milkbag-verification'].value;
        const index = routes.findIndex((r) => r.includes(verificationPage));
        if (index !== -1) skipToPage(index);
        return;
      }

      case 'milkbag-tutorial':
        setDonationTutorialState({ completed: true });
        nextPage();
        return;
    }
  }

  return { nextPage: handleNext, currentPageIndex, hasNextPage };
}

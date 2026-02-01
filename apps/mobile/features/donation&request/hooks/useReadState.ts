import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isDonation } from '@lactalink/utilities/type-guards';
import { useCallback } from 'react';
import { useDonationReadMutation, useRequestReadMutation } from './mutations';

export function useReadState(doc: Donation | Request) {
  const isUnread = doc.reads?.docs?.length === 0;

  const donationMutation = useDonationReadMutation();
  const requestMutation = useRequestReadMutation();

  const markAsRead = useCallback(() => {
    if (isDonation(doc)) {
      donationMutation.mutate(doc);
    } else {
      requestMutation.mutate(doc);
    }
  }, [doc, donationMutation, requestMutation]);

  return { isUnread, markAsRead };
}

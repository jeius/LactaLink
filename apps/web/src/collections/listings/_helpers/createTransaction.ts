import { Donation, Request, User } from '@lactalink/types/payload-generated-types';
import { PayloadRequest } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';

export async function createP2PTransaction({
  req,
  donation,
  request,
  user,
  milkbagIds,
}: {
  req: PayloadRequest;
  donation: Donation;
  request: Request;
  user: User;
  milkbagIds: string[];
}) {
  const userProfile = user.profile;

  return req.payload.create({
    req,
    depth: 0,
    collection: 'transactions',
    data: {
      type: 'P2P',
      status: 'PENDING',
      donation: donation.id,
      request: request.id,
      milkBags: milkbagIds,
      sender: { relationTo: 'individuals', value: extractID(donation.donor) },
      recipient: { relationTo: 'individuals', value: extractID(request.requester) },
      initiatedBy: userProfile
        ? { ...userProfile, value: extractID(userProfile.value) }
        : undefined!,
      // The following fields are placeholders to avoid TS errors;
      // the backend will overwrite them with calculated values.
      volume: undefined!,
      txn: undefined!,
      tracking: undefined!,
    },
  });
}

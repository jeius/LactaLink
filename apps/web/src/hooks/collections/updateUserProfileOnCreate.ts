import { PROFILE_TYPES } from '@lactalink/enums';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook, CollectionSlug } from 'payload';

type Collection = Individual | Hospital | MilkBank;
type Slug = Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;

export const updateUserProfileOnCreate: CollectionAfterChangeHook<Collection> = async ({
  req,
  operation,
  doc,
  collection,
}) => {
  if (operation !== 'create' || !req.user) return;

  const user = req.user;
  const slug = collection.slug as Slug;

  const profileType: Record<Slug, keyof typeof PROFILE_TYPES> = {
    individuals: PROFILE_TYPES.INDIVIDUAL.value,
    hospitals: PROFILE_TYPES.HOSPITAL.value,
    milkBanks: PROFILE_TYPES.MILK_BANK.value,
  };

  await req.payload.update({
    req,
    collection: 'users',
    id: user.id,
    data: {
      profileType: profileType[slug],
      profile: {
        relationTo: slug,
        value: doc.id,
      },
    },
    depth: 0,
  });
};

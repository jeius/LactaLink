import { Collection } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

type CollectionWithAlt = Extract<Collection, { alt?: string | null }>;

export const generateAlt: CollectionBeforeChangeHook<CollectionWithAlt> = async ({
  data,
  req,
  operation,
}) => {
  // Only generate when there is no alt and operation is on create.
  if (data.alt || operation !== 'create') return data;

  if (!req.user) return data;

  if (!req.file || !req.file.mimetype.startsWith('image/')) return data;

  let name = req.user.email;

  if (req.user.profile) {
    const { displayName } = await req.payload.findByID({
      collection: req.user.profile.relationTo,
      id: extractID(req.user.profile.value),
      select: { displayName: true },
      req,
    });
    if (displayName) name = displayName;
  }

  data.alt = `Photo uploaded by ${name}`;

  return data;
};

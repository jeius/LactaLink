import {
  Hospital,
  Individual,
  MilkBank,
  UserSearch,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types';
import { CollectionAfterReadHook } from 'payload';

type Doc = Individual | Hospital | MilkBank;

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc }) => {
  const doc = originalDoc as Doc;
  const { displayName } = doc;

  const namesObj = isIndividual(doc)
    ? { givenName: doc.givenName, middleName: doc.middleName, familyName: doc.familyName }
    : { name: doc.name };

  const namesArray = Object.values(namesObj).filter(Boolean) as string[];

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    title: displayName || 'Untitled',
    searchExcerpt: namesArray.join(' '),
  };

  return modifiedDoc;
};

export const populateDoc: CollectionAfterReadHook<UserSearch> = async ({ doc, req }) => {
  if (doc.doc) {
    const populatedDoc = await req.payload.findByID({
      id: extractID(doc.doc.value),
      collection: doc.doc.relationTo,
      req,
      depth: 5,
    });

    if (populatedDoc) doc.doc.value = populatedDoc;
  }
  return doc;
};

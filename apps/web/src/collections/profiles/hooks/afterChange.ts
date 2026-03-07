import { hookLogger } from '@lactalink/agents/payload';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { deletePreviousAvatar } from '../helpers/deletePreviousAvatar';
import { updateUserProfile } from '../helpers/updateUser';

export const afterChange: CollectionAfterChangeHook<Hospital | MilkBank | Individual> = async ({
  req,
  doc,
  collection,
  operation,
  previousDoc,
}) => {
  if (operation === 'create') {
    const logger = hookLogger(req, collection.slug, 'afterCreate');

    // Update the user's profile reference to the newly created profile document.
    const user = await updateUserProfile(doc.id, collection, req, logger);
    if (user) doc.owner = user;
  }

  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');
    await deletePreviousAvatar(doc, previousDoc, req, logger);
  }

  return doc;
};

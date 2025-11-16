import { Like, User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { MutationKey, QueryKey } from '@tanstack/react-query';
import { MUTATION_KEYS } from '../constants';

export function createMutationKey(...parts: MutationKey[]): MutationKey {
  return [...parts].flat();
}

export function createQueryKey(...parts: QueryKey[]): QueryKey {
  return [...parts].flat();
}

export function createLikeMutationKey(doc: Like['liked']) {
  return createMutationKey(MUTATION_KEYS.LIKE_INTERACTION, [doc.relationTo, extractID(doc.value)]);
}

export function createAddCommentMutationKey(user: User | null) {
  return createMutationKey(MUTATION_KEYS.ADD_COMMENT, [extractID(user)]);
}

export function createDeleteCommentMutationKey(user: User | null) {
  return createMutationKey(MUTATION_KEYS.DELETE_COMMENT, [extractID(user)]);
}

import { ConversationParticipant, Message } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { areStrings } from '@lactalink/utilities/type-guards';
import { useQuery } from '@tanstack/react-query';
import isString from 'lodash/isString';
import {
  createConvoParticipantsQueryOptions,
  createMessageQueryOptions,
} from '../lib/queryOptions';

export function useMessage(message: string | Message | undefined | null) {
  const { data, ...query } = useQuery(
    createMessageQueryOptions(extractID(message), isString(message))
  );

  return { ...query, data: message === null ? null : extractCollection(message) || data };
}

export function useConvoParticipantsQuery(
  participants: (string | ConversationParticipant)[] | undefined
) {
  const participantIds = (participants || []).map((p) => extractID(p));
  const queryOptions = createConvoParticipantsQueryOptions(
    participantIds,
    areStrings(participants || [])
  );

  const { data, ...query } = useQuery(queryOptions);

  return { ...query, data: extractCollection(participants) || data };
}

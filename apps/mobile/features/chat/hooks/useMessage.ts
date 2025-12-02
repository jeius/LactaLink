import { Message } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useQuery } from '@tanstack/react-query';
import isString from 'lodash/isString';
import { createMessageQueryOptions } from '../lib/queryOptions';

export function useMessage(message: string | Message | undefined) {
  const { data, ...query } = useQuery(
    createMessageQueryOptions(extractID(message), isString(message))
  );

  return { ...query, data: extractCollection(data) || data };
}

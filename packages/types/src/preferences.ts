import { ApiMethod } from './api';

/**
 * Represents a preference object retrieved from the API.
 *
 * @template T - The type of the preference value.
 */
export type GetPreference<T> = {
  _id: string;
  key: string;
  user: string;
  userCollection: string;
  __v: number;
  value: T;
};

/**
 * Represents the response from a successful POST request to create or update a preference.
 *
 * @template T - The type of the preference value.
 */
export type UpdatePreference<T = unknown> = {
  message: string;
  doc: {
    user: string;
    key: string;
    userCollection: string;
    value: T;
  };
};

export type Preference<TMethod extends ApiMethod, TValue = unknown> = TMethod extends 'GET'
  ? GetPreference<TValue>
  : TMethod extends 'POST'
    ? UpdatePreference<TValue>
    : TMethod extends 'DELETE'
      ? { message: string }
      : never;

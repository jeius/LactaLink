import { QueryKey } from '@tanstack/react-query';

interface QueryKeys {
  AUTH: {
    ALL: QueryKey;
    SESSION: QueryKey;
    USER: QueryKey;
  };
  USER_THEME: QueryKey;
  MARKERS: QueryKey;
  TUTORIAL_STATE: QueryKey;
  POSTS: {
    ALL: QueryKey;
    INFINITE: QueryKey;
    ONE: QueryKey;
  };
}

export const QUERY_KEYS: QueryKeys = {
  AUTH: {
    ALL: ['auth'],
    SESSION: ['auth', 'session'],
    USER: ['auth', 'users'],
  },
  USER_THEME: ['user-theme'],
  MARKERS: ['markers'],
  TUTORIAL_STATE: ['tutorial-state'],
  POSTS: {
    ALL: ['posts'],
    INFINITE: ['posts', 'infinite'],
    ONE: ['posts', 'one'],
  },
};

export const INFINITE_QUERY_KEY = ['infinite'];
export const COLLECTION_QUERY_KEY = ['collection'];

export const MUTATION_KEYS = {
  LIKE_INTERACTION: ['likes', 'interaction'],
  ADD_COMMENT: ['comments', 'add'],
  DELETE_COMMENT: ['comments', 'delete'],
};

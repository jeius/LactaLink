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
  SEARCH: {
    ALL: QueryKey;
    USER: QueryKey;
  };
  CHATS: {
    ALL: QueryKey;
    INFINITE: QueryKey;
    ONE: QueryKey;
  };
  PROFILE: {
    ALL: QueryKey;
    ONE: QueryKey;
  };
  TRANSACTIONS: {
    ALL: QueryKey;
    INFINITE: QueryKey;
    ONE: QueryKey;
  };
  DELIVERY_PLANS: {
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
  SEARCH: {
    ALL: ['search'],
    USER: ['search', 'user'],
  },
  CHATS: {
    ALL: ['conversations'],
    INFINITE: ['conversations', 'infinite'],
    ONE: ['conversations', 'one'],
  },
  PROFILE: {
    ALL: ['profiles'],
    ONE: ['profiles', 'one'],
  },
  TRANSACTIONS: {
    ALL: ['transactions'],
    INFINITE: ['transactions', 'infinite'],
    ONE: ['transactions', 'one'],
  },
  DELIVERY_PLANS: {
    ALL: ['delivery-plans'],
    INFINITE: ['delivery-plans', 'infinite'],
    ONE: ['delivery-plans', 'one'],
  },
};

export const INFINITE_QUERY_KEY = ['infinite'];
export const COLLECTION_QUERY_KEY = ['collection'];

export const MUTATION_KEYS = {
  LIKE_INTERACTION: ['likes', 'interaction'],
  ADD_COMMENT: ['comments', 'add'],
  DELETE_COMMENT: ['comments', 'delete'],
};

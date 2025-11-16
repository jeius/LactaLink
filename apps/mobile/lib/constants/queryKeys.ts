interface QueryKeys {
  AUTH: {
    ALL: string[];
    SESSION: string[];
    USER: string[];
  };
  USER_THEME: string[];
  MARKERS: string[];
  TUTORIAL_STATE: string[];
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
};

export const INFINITE_QUERY_KEY = ['infinite'];
export const COLLECTION_QUERY_KEY = ['collection'];

export const MUTATION_KEYS = {
  LIKE_INTERACTION: ['likes', 'interaction'],
  ADD_COMMENT: ['comments', 'add'],
  DELETE_COMMENT: ['comments', 'delete'],
};

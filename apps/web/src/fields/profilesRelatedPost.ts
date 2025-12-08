import { JoinField } from 'payload';

export function profilesRelatedPostsField(overrides: Partial<JoinField> = {}): JoinField {
  return {
    name: 'posts',
    label: 'Written Posts',
    type: 'join',
    collection: 'posts',
    on: 'author',
    maxDepth: 3,
    defaultLimit: 5,
    admin: {
      description: 'Posts authored by this user.',
      defaultColumns: ['title', 'createdAt'],
      ...overrides.admin,
    },
    ...overrides,
  };
}

import { User } from '@lactalink/types/payload-generated-types';

export type CreateConvoSearchParams = {
  type?: 'direct' | 'group';
};

export type CreateGroupChatData = {
  name: string;
  participants: NonNullable<User['profile']>[];
};

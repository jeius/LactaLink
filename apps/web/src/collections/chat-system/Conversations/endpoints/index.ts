import { Endpoint } from 'payload';
import { findDirectConversationHandler } from './findDirectConversation';

export const endpoints: Endpoint[] = [
  {
    method: 'get',
    path: '/direct',
    handler: findDirectConversationHandler,
  },
];

export default endpoints;

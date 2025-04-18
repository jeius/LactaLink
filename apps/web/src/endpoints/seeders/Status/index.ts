import { PayloadHandler } from 'payload';
import { seedStatus } from './seedStatus';

export const seedStatusHandler: PayloadHandler = () => {
  return Response.json({ messages: seedStatus });
};

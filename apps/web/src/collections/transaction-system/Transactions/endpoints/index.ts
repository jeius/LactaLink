import { Endpoint } from 'payload';
import { commandHandler } from './commands';

const transactionEndpoints: Endpoint[] = [
  {
    path: '/:id/commands',
    method: 'post',
    handler: commandHandler,
  },
];

export default transactionEndpoints;

import { pino } from 'pino';
import pretty from 'pino-pretty';

const isProd = process.env.NODE_ENV === 'production';

// Configure pino-pretty for pretty printing
const stream = pretty({
  colorize: true, // Enable colorization
  translateTime: 'SYS:HH:MM:ss', // Format timestamp
  ignore: 'pid,hostname', // Ignore these fields
});

export const logger = pino(
  {
    level: isProd ? 'error' : 'info',
    enabled: true,
  },
  stream
);

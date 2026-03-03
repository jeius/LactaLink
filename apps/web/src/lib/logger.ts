import { pino } from 'pino';
import pretty from 'pino-pretty';

const isProd = process.env.NODE_ENV === 'production';
const enableDebugLogs = process.env.ENABLE_DEBUG_LOGS === 1;

// Configure pino-pretty for pretty printing
const stream = pretty({
  colorize: true, // Enable colorization
  translateTime: 'SYS:HH:MM:ss', // Format timestamp
  ignore: 'pid,hostname', // Ignore these fields
});

export const logger = pino(
  {
    level: isProd ? (enableDebugLogs ? 'info' : 'error') : 'info',
    enabled: true,
  },
  stream
);

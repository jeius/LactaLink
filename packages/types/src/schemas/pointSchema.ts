import { z } from 'zod';

export const pointSchema = z
  .tuple([
    z
      .number('Longitude must be a valid number')
      .min(-180, { message: 'Longitude must be between -180 and 180' })
      .max(180, { message: 'Longitude must be between -180 and 180' }),
    z
      .number('Latitude must be a valid number')
      .min(-90, { message: 'Latitude must be between -90 and 90' })
      .max(90, { message: 'Latitude must be between -90 and 90' }),
  ])
  .refine((val) => Array.isArray(val) && val.length === 2, {
    message: 'Invalid point format. Expected [longitude, latitude]',
  });

export type Point = z.infer<typeof pointSchema>;

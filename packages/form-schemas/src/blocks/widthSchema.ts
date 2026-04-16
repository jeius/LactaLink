import { WIDTH_OPTIONS } from '@lactalink/enums';
import z from 'zod';

export const widthOptions = Object.values(WIDTH_OPTIONS).map((option) => option.value);

export const widthSchema = z.enum(widthOptions, 'Invalid width option');

export type WidthSchema = z.infer<typeof widthSchema>;

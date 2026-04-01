import { SEED_SCREENING_FORM_URL } from '@/lib/constants/routes';
import { Endpoint } from 'payload';
import handler from './handler';

export const ScreeningFormSeeder: Endpoint = {
  method: 'post',
  path: SEED_SCREENING_FORM_URL.replace('/api', ''),
  handler: handler,
};

export default ScreeningFormSeeder;

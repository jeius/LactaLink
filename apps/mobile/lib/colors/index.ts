import { config } from '@/components/ui/gluestack-ui-provider/config';
import { resolveColors } from './resolveColors';

console.log(config);
export const colors = {
  light: resolveColors(config.light),
  dark: resolveColors(config.dark),
};

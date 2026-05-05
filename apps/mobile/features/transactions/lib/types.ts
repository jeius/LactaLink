import { ButtonProps } from '@/components/ui/button';
import { DeliveryUpdate } from '@lactalink/types/payload-generated-types';

export type ProposeSearchParams = {
  txnID?: string;
  edit?: 'true' | 'false';
};

export type DeliveryAction = {
  /** Button label shown to the user */
  label: string;
  /** Delivery update status this action sets */
  status: DeliveryUpdate['status'];
  /** Whether this is a destructive/secondary action */
  action?: ButtonProps['action'];
};

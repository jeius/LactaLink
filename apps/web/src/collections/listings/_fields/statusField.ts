import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { FieldHook, SelectField } from 'payload';

/**
 * Defines a reusable status field for both Donations and Requests collections.
 *
 * @param label - The label to display for the status field in the admin UI.
 * @param adminOverrides - Optional overrides for the admin configuration of the field.
 * @returns A configured SelectField for status with appropriate options and hooks.
 */
export function statusField(
  label: string,
  adminOverrides: Partial<SelectField['admin']> = {}
): SelectField {
  return {
    name: 'status',
    label: label,
    type: 'select',
    enumName: 'enum_donation_request_status',
    required: true,
    defaultValue: DONATION_REQUEST_STATUS.AVAILABLE.value,
    options: Object.values(DONATION_REQUEST_STATUS),
    admin: { width: '50%', ...adminOverrides },
    hooks: { beforeValidate: [beforeValidate] },
  };
}

const beforeValidate: FieldHook<Donation | Request, Donation['status']> = ({ data }) => {
  // If there's a recipient, the status should be PENDING; otherwise, it should be AVAILABLE.
  if (data?.recipient) {
    return DONATION_REQUEST_STATUS.PENDING.value;
  }
  return DONATION_REQUEST_STATUS.AVAILABLE.value;
};

/**
 * @fileoverview Defines fields for profile collections.
 * This includes common fields like display name and owner, as well as any shared field configurations.
 */

import { createUserField } from '@/fields/userField';
import { ProfileHookContext } from '@/lib/constants/hookContexts';
import { setHookContext } from '@lactalink/agents/payload';
import { extractID } from '@lactalink/utilities/extractors';
import { RequestContext, SingleRelationshipField } from 'payload';

export * from './displayNameField';

/**
 * Helper function to create an owner field for profile collections.
 * This field is virtual and read-only in the admin UI, and defaults to the authenticated user on create.
 * @param description - Description for the owner field in the admin UI.
 * @returns A configured user field for ownership.
 */
export function ownerField(description: string) {
  return createUserField({
    name: 'owner',
    virtual: true,
    admin: { description, readOnly: true },
    hooks: {
      beforeValidate: [
        async ({ value, req }) => {
          // Since this is a virtual field, we need to set the context for hooks
          // that rely on the owner information.
          const ownerID = extractID(value);
          setHookContext<RequestContext['user']>(req, ProfileHookContext.Owner, ownerID);
          return ownerID;
        },
      ],
    },
  });
}

/**
 * Helper function to create a default address relationship field for profile collections.
 * This field is virtual and read-only in the admin UI, and retrieves the default address for the profile owner.
 * @param description - Optional description for the default address field in the admin UI.
 */
export function defaultAddressField(description?: string): SingleRelationshipField {
  return {
    name: 'defaultAddress',
    label: 'Default Address',
    type: 'relationship',
    relationTo: 'addresses',
    virtual: true,
    admin: {
      description: description,
      readOnly: true,
      position: 'sidebar',
    },
    access: {
      create: () => false,
      read: () => true,
      update: () => false,
    },
  };
}

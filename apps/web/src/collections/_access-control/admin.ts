import { isAdmin } from '@/lib/utils/isAdmin';
import { PayloadRequest } from 'payload';

// This file defines admin access control rules for collections in Payload CMS.

export function admin({ req }: { req: PayloadRequest }): boolean | Promise<boolean> {
  const user = req.user;

  if (isAdmin(user)) return true;

  return false; // Deny access for all other roles
}

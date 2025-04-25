import { PayloadRequest } from 'payload';

export function adminAccessControl({ req }: { req: PayloadRequest }): boolean | Promise<boolean> {
  const user = req.user;

  if (user && user.role === 'ADMIN') {
    return true; // Allow access
  }

  return false; // Deny access for all other roles
}

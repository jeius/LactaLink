import { Access, PayloadRequest } from 'payload';

export function adminAccessControl({ req }: { req: PayloadRequest }): boolean | Promise<boolean> {
  const user = req.user;

  if (user && user.role === 'ADMIN') {
    return true; // Allow access
  }

  return false; // Deny access for all other roles
}

export const ownerAccessControl: Access = ({ req, id }) => {
  const user = req.user;

  if (user && user.id === id) {
    return true; // Allow access
  }

  return false;
};

export const ownerOrAdminAccessControl: Access = ({ req, id }) => {
  const user = req.user;

  if (user && (user.id === id || user.role === 'ADMIN')) {
    return true; // Allow access for owner or admin
  }

  return false; // Deny access for all other cases
};

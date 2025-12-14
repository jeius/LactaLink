import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';
import { DONOR_SCREENING_STATUS } from '../index';

/**
 * Auto-populate submittedBy field with the current user's individual profile
 */
export const generateSubmittedBy: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation !== 'create' || !req.user?.profile) return data;

  // Auto-populate submittedBy from authenticated user's profile
  if (!data.submittedBy && req.user.profile.relationTo === 'individuals') {
    data.submittedBy = extractID(req.user.profile.value);
  }

  return data;
};

/**
 * Auto-populate submittedAt timestamp on creation
 */
export const generateSubmittedAt: CollectionBeforeChangeHook = ({ operation, data }) => {
  if (operation !== 'create') return data;

  data.submittedAt = new Date().toISOString();

  return data;
};

/**
 * Auto-populate reviewedBy and reviewedAt when status changes to approved/rejected
 */
export const generateReviewDetails: CollectionBeforeChangeHook = ({
  req,
  operation,
  data,
  originalDoc,
}) => {
  if (operation !== 'update' || !req.user) return data;

  const previousStatus = originalDoc?.status;
  const newStatus = data.status;

  // Check if status changed to approved or rejected
  const statusChanged =
    (newStatus === DONOR_SCREENING_STATUS.APPROVED ||
      newStatus === DONOR_SCREENING_STATUS.REJECTED) &&
    previousStatus !== newStatus;

  if (statusChanged) {
    data.reviewedBy = extractID(req.user);
    data.reviewedAt = new Date().toISOString();
  }

  return data;
};

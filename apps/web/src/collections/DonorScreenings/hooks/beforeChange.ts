import { SCREENING_STATUS } from '@lactalink/enums';
import { DonorScreening } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook, FieldHook } from 'payload';

const APPROVED = SCREENING_STATUS.APPROVED.value;
const REJECTED = SCREENING_STATUS.REJECTED.value;

/**
 * Auto-populate submittedBy field with the current user's individual profile
 */
export const generateSubmittedBy: FieldHook<DonorScreening> = ({ req, operation, value }) => {
  if (operation !== 'create' || !req.user?.profile) return value;

  if (value && value !== '') return value;

  // Auto-populate submittedBy from authenticated user's profile
  if (req.user.profile.relationTo === 'individuals') {
    return extractID(req.user.profile.value);
  }

  return value;
};

/**
 * Auto-populate submittedAt timestamp on creation
 */
export const generateSubmittedAt: FieldHook<DonorScreening> = ({ operation, value }) => {
  if (operation !== 'create') return value;

  return new Date().toISOString();
};

/**
 * Auto-populate reviewedBy and reviewedAt when status changes to approved/rejected
 */
export const generateReviewDetails: CollectionBeforeChangeHook<DonorScreening> = ({
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
    (newStatus === APPROVED || newStatus === REJECTED) && previousStatus !== newStatus;

  if (statusChanged) {
    data.reviewedBy = extractID(req.user);
    data.reviewedAt = new Date().toISOString();
  }

  return data;
};

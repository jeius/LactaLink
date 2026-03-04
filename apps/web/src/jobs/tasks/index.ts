import { calculateCommentReplyCount, calculatePostCommentCount } from './calculateCounters';
import { idVerificationTask } from './idVerification';
import { sendEmailTask } from './sendEmail';
import { updateOrganizationStock } from './updateOrganizationStock';

const tasks = [
  idVerificationTask,
  sendEmailTask,
  calculatePostCommentCount,
  calculateCommentReplyCount,
  updateOrganizationStock,
];

export default tasks;

import { calculateCommentReplyCount, calculatePostCommentCount } from './calculateCounters';
import { idVerificationTask } from './idVerification';
import { sendEmailTask } from './sendEmail';

const tasks = [
  idVerificationTask,
  sendEmailTask,
  calculatePostCommentCount,
  calculateCommentReplyCount,
];

export default tasks;

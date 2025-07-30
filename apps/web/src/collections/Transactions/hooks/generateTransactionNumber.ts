import { Transaction } from '@lactalink/types';
import { randomBytes } from 'crypto';
import { CollectionBeforeChangeHook } from 'payload';

export const generateTransactionNumber: CollectionBeforeChangeHook<Transaction> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || data.transactionNumber) {
    return data;
  }

  const prefix = 'TXN';
  const timestamp = Date.now().toString().slice(-8);
  const randomDigits = randomBytes(5).toString('hex').slice(0, 4).toUpperCase();

  const transactionNumber = `${prefix}-${timestamp}-${randomDigits}`;

  return {
    ...data,
    transactionNumber,
  };
};

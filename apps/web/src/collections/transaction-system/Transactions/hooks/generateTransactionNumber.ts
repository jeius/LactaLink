import { Transaction } from '@lactalink/types/payload-generated-types';
import { randomBytes } from 'crypto';
import { FieldHook } from 'payload';

export const generateTransactionNumber: FieldHook<Transaction> = ({ data, value }) => {
  if (value && value.trim() !== '') {
    return data;
  }

  const prefix = 'TXN';
  const timestamp = Date.now().toString().slice(-8).toUpperCase();
  const randomDigits = randomBytes(5).toString('hex').slice(0, 4).toUpperCase();

  return `${prefix}-${timestamp}-${randomDigits}`;
};

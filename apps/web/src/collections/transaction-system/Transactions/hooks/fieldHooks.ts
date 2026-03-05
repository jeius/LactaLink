import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { areStrings } from '@lactalink/utilities/type-guards';
import { randomBytes } from 'crypto';
import { FieldHook } from 'payload';

/**
 * Transaction `FieldHook` to generate a unique transaction number.
 *
 * @description
 * Generats a unique transaction number for each new transaction in the format `TXN-XXXXXXXX-XXXX`,
 * where `XXXXXXXX` is the last 8 digits of the current timestamp and `XXXX` is a random 4-digit
 * hexadecimal string.
 */
export const generateTransactionNumber: FieldHook<Transaction, Transaction['txn'], Transaction> = ({
  value,
}) => {
  if (value && value.trim() !== '') {
    return value;
  }

  const prefix = 'TXN';
  const timestamp = Date.now().toString().slice(-8).toUpperCase();
  const randomDigits = randomBytes(5).toString('hex').slice(0, 4).toUpperCase();
  const generatedNumber = `${prefix}-${timestamp}-${randomDigits}`;

  return generatedNumber;
};

/**
 * Transaction `FieldHook` to calculate the total volume of matched milk bags for a transaction.
 *
 * @description
 * This hook is executed before reading a transaction document. It calculates
 * the `matchedVolume` property based on the `milkBags` field in the document.
 * If no `milkBags` are present or the list is empty, the `matchedVolume` is set to 0.
 * Otherwise, it retrieves the volumes of the matched milk bags from the `milkBags` collection
 * and sums them up to compute the total volume.
 *
 * @returns The updated transaction document with the calculated `matchedVolume`.
 */
export const calculateVolume: FieldHook<Transaction, Transaction['volume'], Transaction> = async ({
  req,
  data,
  value,
}) => {
  if (!data?.milkBags) return value ?? 0;

  const bags = extractCollection(data.milkBags);

  if (areStrings(data.milkBags)) {
    const { docs } = await req.payload.find({
      collection: 'milkBags',
      depth: 0,
      req,
      select: { volume: true },
      pagination: false,
      limit: 0, // Fetch all matching bags
      where: { id: { in: extractID(data.milkBags) } },
    });

    return docs.reduce((total, bag) => total + (bag.volume ?? 0), 0);
  }

  return bags.reduce((total, bag) => total + (bag.volume ?? 0), 0);
};

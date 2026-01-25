import { Transaction } from '@lactalink/types/payload-generated-types';
import { useMutation } from '@tanstack/react-query';
import { createAgreeMutation, createDisagreeMutation } from '../lib/mutationOptions';

export function useAgreeMutation(transaction: Transaction) {
  return useMutation(createAgreeMutation(transaction));
}

export function useDisagreeMutation(transaction: Transaction) {
  return useMutation(createDisagreeMutation(transaction));
}

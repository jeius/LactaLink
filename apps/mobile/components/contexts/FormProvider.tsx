/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkOptional } from '@lactalink/types/utils';
import { createContext, useContext } from 'react';
import {
  FieldValues,
  FormProvider,
  FormProviderProps,
  useFormContext,
  UseFormReturn,
} from 'react-hook-form';

type AdditionalContextType<T = any> = {
  isLoading: boolean;
  isFetching: boolean;
  fetchError: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
  extraData?: T;
};

const AdditionalContext = createContext<AdditionalContextType | undefined>(undefined);

export type UseForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
  TAdditionalContext = any,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  additionalState: AdditionalContextType<TAdditionalContext>;
};

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
  TAdditionalContext = any,
>(): UseForm<TFieldValues, TContext, TTransformedValues, TAdditionalContext> {
  const additionalContext = useContext(AdditionalContext);

  if (!additionalContext) {
    throw new Error('useForm must be used within a FormProvider');
  }

  try {
    const formContext = useFormContext<TFieldValues, TContext, TTransformedValues>();
    return { ...formContext, additionalState: additionalContext };
  } catch {
    throw new Error('useForm must be used within a FormProvider');
  }
}

export type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = FormProviderProps<TFieldValues, TContext, TTransformedValues> &
  MarkOptional<
    AdditionalContextType,
    'onRefresh' | 'refreshing' | 'fetchError' | 'isFetching' | 'isLoading'
  >;

export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  isFetching = false,
  isLoading = false,
  fetchError = null,
  refreshing = false,
  onRefresh = () => {},
  extraData,
  children,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...props}>
      <AdditionalContext.Provider
        value={{ isLoading, isFetching, fetchError, refreshing, onRefresh, extraData }}
      >
        {children}
      </AdditionalContext.Provider>
    </FormProvider>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddressCreateSchema,
  addressCreateSchema,
  AddressSchema,
  addressSchema,
} from '@lactalink/form-schemas';

import { useForm } from 'react-hook-form';

import { FormProps } from '@/components/contexts/FormProvider';
import { transformToAddressSchema } from '@/lib/utils/transformData';
import { useEffect } from 'react';
import { useFetchById } from '../collections/useFetchById';

type InputType = string | undefined | null;

type FormReturnType<T extends InputType> = T extends string
  ? FormProps<AddressSchema>
  : FormProps<AddressCreateSchema>;

export function useAddressForm<T extends InputType = undefined>(id: T): FormReturnType<T> {
  const { data: address, ...query } = useFetchById(!!id, {
    collection: 'addresses',
    id: id || '',
    depth: 0,
  });

  const form = useForm({
    resolver: zodResolver(id ? addressSchema : addressCreateSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      street: '',
      zipCode: '',
    },
  });

  const reset = form.reset;

  useEffect(() => {
    if (address) {
      const transformed = transformToAddressSchema(address);
      reset(transformed);
    }
  }, [reset, address]);

  return {
    ...form,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refreshing: query.isRefetching,
    fetchError: query.error,
    extraData: address,
    onRefresh() {
      query.refetch();
    },
  } as FormReturnType<T>;
}

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddressCreateSchema,
  addressCreateSchema,
  AddressSchema,
  addressSchema,
} from '@lactalink/form-schemas';

import { useForm } from 'react-hook-form';

import { FormProps } from '@/components/contexts/FormProvider';
import { useCurrentCoordinates } from '@/lib/stores';
import { transformToAddressSchema } from '@/lib/utils/transformData';
import { useEffect, useMemo } from 'react';
import { useAddress } from './queries';

type InputType = string | undefined | null;

type FormReturnType<T extends InputType> = T extends string
  ? FormProps<AddressSchema>
  : FormProps<AddressCreateSchema>;

export function useAddressForm<T extends InputType = undefined>(id?: T): FormReturnType<T> {
  const { data: address, ...query } = useAddress(id);

  const currentCoordinates = useCurrentCoordinates();

  const values = useMemo(
    () => (address ? transformToAddressSchema(address) : undefined),
    [address]
  );

  const form = useForm({
    resolver: zodResolver(id ? addressSchema : addressCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      isDefault: false,
      street: '',
      zipCode: '',
      coordinates: currentCoordinates || undefined,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (values) reset(values);
  }, [reset, values]);

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

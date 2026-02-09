import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldPath, FieldValues, useWatch } from 'react-hook-form';

import { ComboboxField } from '@/components/form-fields/ComboboxField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { extractID } from '@lactalink/utilities/extractors';
import debounce from 'lodash/debounce';
import { useInfiniteProvinces, useProvince } from '../../hooks/queries';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<BaseFieldProps<TFieldValues, TName>, 'error'> & {
  placeholder?: string;
};

export function ProvinceSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ placeholder = 'Select a province...', ...props }: Props<TFieldValues, TName>) {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');

  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), [setSearch]);

  const currentProvince = useWatch({ name: props.name, control: props.control });

  const { data: province, ...query } = useProvince(extractID(currentProvince));

  const { data: provinces, ...listQuery } = useInfiniteProvinces(search);

  const error = query.error || listQuery.error;

  const handleTextChange = useCallback(
    (text: string) => {
      setInputValue(text);
      debouncedSetSearch(text);
    },
    [debouncedSetSearch]
  );

  useEffect(() => debouncedSetSearch.cancel, [debouncedSetSearch]);

  return (
    <ComboboxField
      {...props}
      error={error}
      items={provinces}
      transformItem={(item) => ({ value: item.id, label: item.name })}
      triggerInputProps={{
        placeholder,
        value: query.isLoading ? 'Loading province...' : province?.name,
        isLoading: query.isLoading,
      }}
      comboboxProps={{
        listProps: listQuery,
        searchInputProps: {
          showSearchIcon: true,
          value: inputValue,
          onChangeText: handleTextChange,
          placeholder: 'Search province here...',
        },
      }}
    />
  );
}

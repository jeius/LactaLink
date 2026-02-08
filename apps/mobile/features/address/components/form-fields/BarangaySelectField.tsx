import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldPath, FieldValues, useWatch } from 'react-hook-form';

import { ComboboxField } from '@/components/form-fields/ComboboxField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { TextProps } from '@/components/ui/text';
import { extractID } from '@lactalink/utilities/extractors';
import debounce from 'lodash/debounce';
import { useBarangay, useInfiniteBarangays } from '../../hooks/queries';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<BaseFieldProps<TFieldValues, TName>, 'error'> & {
  placeholder?: string;
  triggerTextClassName?: TextProps['className'];
  cityID?: string;
};

export function BarangaySelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  placeholder = 'Select a barangay...',
  triggerTextClassName,
  cityID,
  ...props
}: Props<TFieldValues, TName>) {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');

  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), [setSearch]);

  const currentCity = useWatch({ name: props.name, control: props.control });

  const { data: doc, ...query } = useBarangay(extractID(currentCity));

  const { data: docs, ...listQuery } = useInfiniteBarangays(search, cityID);

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
      items={docs}
      transformItem={(item) => ({ value: item.id, label: item.name })}
      triggerInputProps={{
        placeholder: placeholder,
        className: triggerTextClassName,
        label: query.isLoading ? 'Loading barangay...' : doc?.name,
        isLoading: query.isLoading,
      }}
      comboboxProps={{
        listProps: listQuery,
        searchInputProps: {
          showSearchIcon: true,
          value: inputValue,
          onChangeText: handleTextChange,
          placeholder: 'Search barangay here...',
        },
      }}
    />
  );
}

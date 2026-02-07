import { ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import {
  Select,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
} from './sheet/select';

interface ComboboxProps<T> extends Omit<SelectProps<T>, 'header' | 'children'> {
  items: T[];
  renderItem: ListRenderItem<T>;
  itemStyle?: SelectItemProps<T>['style'];
  itemClassName?: SelectItemProps<T>['className'];
  listProps?: Omit<SelectListProps<T>, 'data' | 'renderItem'>;
  inputProps?: SelectInputProps;
}

export default function Combobox<T>({
  listProps,
  inputProps,
  items,
  renderItem: renderItemProp,
  detents = [0.45],
  dimmed = true,
  scrollable = true,
  ...props
}: ComboboxProps<T>) {
  const renderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      return <Select.Item value={info.item}>{renderItemProp(info)}</Select.Item>;
    },
    [renderItemProp]
  );

  return (
    <Select
      {...props}
      detents={detents}
      dimmed={dimmed}
      scrollable={scrollable}
      header={<Select.TextInput {...inputProps} />}
      headerStyle={[{ paddingHorizontal: 12, marginBottom: 8 }, props.headerStyle]}
    >
      <Select.List
        {...listProps}
        data={items}
        renderItem={renderItem}
        nestedScrollEnabled={listProps?.nestedScrollEnabled ?? true}
      />
    </Select>
  );
}

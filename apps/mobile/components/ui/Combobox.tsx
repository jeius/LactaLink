import { ListRenderItem } from '@/lib/types';
import { useCallback } from 'react';
import { ViewProps } from 'react-native';
import { NoData } from '../NoData';
import { Select, SelectItemProps, SelectListProps, SelectProps } from './sheet/select';
import { SelectContentProps, SelectSearchInputProps } from './sheet/select/types';

type ContentProps = Pick<
  SelectContentProps,
  'detents' | 'dimmed' | 'scrollable' | 'headerStyle' | 'cornerRadius'
>;

export interface ComboboxProps<T> extends Omit<SelectProps<T>, 'children'>, ContentProps {
  items: T[];
  renderItem: SelectListProps<T>['renderItem'];
  itemStyle?: SelectItemProps<T>['style'];
  itemClassName?: SelectItemProps<T>['className'];
  listProps?: Omit<SelectListProps<T>, 'data' | 'renderItem'>;
  searchInputProps?: SelectSearchInputProps;
  trigger?: React.ReactNode;
  triggerContainerClassName?: ViewProps['className'];
  triggerContainerStyle?: ViewProps['style'];
  isDisabled?: boolean;
}

export default function Combobox<T>({
  listProps,
  searchInputProps: inputProps,
  items,
  renderItem: renderItemProp,
  detents = [0.45],
  dimmed = true,
  scrollable = true,
  headerStyle,
  cornerRadius,
  trigger,
  itemClassName,
  itemStyle,
  isDisabled = false,
  triggerContainerClassName,
  triggerContainerStyle,
  ...props
}: ComboboxProps<T>) {
  const renderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      return (
        <Select.Item value={info.item} className={itemClassName} style={itemStyle}>
          {renderItemProp(info)}
        </Select.Item>
      );
    },
    [itemClassName, itemStyle, renderItemProp]
  );

  return (
    <Select {...props}>
      {trigger && (
        <Select.Trigger
          disabled={isDisabled}
          className={triggerContainerClassName}
          style={triggerContainerStyle}
        >
          {trigger}
        </Select.Trigger>
      )}

      <Select.Content
        detents={detents}
        dimmed={dimmed}
        scrollable={scrollable}
        cornerRadius={cornerRadius}
        header={<Select.Search {...inputProps} />}
        headerStyle={[{ paddingHorizontal: 12, marginBottom: 8 }, headerStyle]}
      >
        <Select.List
          {...listProps}
          data={items}
          renderItem={renderItem}
          ListEmptyComponent={
            <NoData
              title={listProps?.emptyListLabel || 'No options available'}
              className="mx-auto mt-5 justify-start"
              style={{ width: '80%' }}
            />
          }
        />
      </Select.Content>
    </Select>
  );
}

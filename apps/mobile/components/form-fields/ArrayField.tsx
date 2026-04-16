import {
  ComponentRef,
  createContext,
  FC,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrayPath,
  type Control,
  FieldArrayWithId,
  type FieldPath,
  type FieldValues,
  useFieldArray,
  UseFieldArrayReturn,
  useFormState,
} from 'react-hook-form';
import { View } from 'react-native';
import { createStore, StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { BoxProps } from '../ui/box';
import { Pressable, PressableProps } from '../ui/pressable';
import Slot from '../ui/Slot';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldArrayProps } from './types';

type ContextStore<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> = {
  name: TName;
  control?: Control<TFieldValues>;
  isDisabled?: boolean;
} & UseFieldArrayReturn<TFieldValues, TName, '_id'>;

const ArrayFieldContext = createContext<StoreApi<ContextStore> | null>(null);

function useArrayFieldContext<T, TFieldValues extends FieldValues = FieldValues>(
  selector: (state: ContextStore<TFieldValues>) => T
) {
  const store = useContext(ArrayFieldContext);
  if (!store) {
    throw new Error('ArrayField components must be used within an ArrayField');
  }
  // @ts-expect-error - The context store is typed with generics, but we can't
  // guarantee the consumer will use the same types. We just want to ensure
  // the selector gets the correct shape.
  return useStore(store, useShallow(selector));
}

type ArrayFieldRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> = BoxProps & {
  fields: FieldArrayWithId<TFieldValues, TName, '_id'>[];
};

interface ArrayFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> extends Omit<BaseFieldArrayProps<TFieldValues, TName>, 'error'> {
  render: FC<ArrayFieldRenderProps>;
}

function ArrayFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  contentPosition = 'last',
  render: RenderContent,
  ...props
}: ArrayFieldProps<TFieldValues, TName>) {
  const fieldArray = useFieldArray({ control, name, keyName: '_id' });
  const { isSubmitting, errors } = useFormState({ control, name: name as FieldPath<TFieldValues> });

  const error = errors[name]?.message ? { message: errors[name].message.toString() } : null;
  const invalid = !!error;
  const disabledFields = isDisabled || isSubmitting || isLoading;

  const [store] = useState(() =>
    createStore<ContextStore<TFieldValues, TName>>(() => ({
      name,
      control,
      isDisabled: disabledFields,
      ...fieldArray,
    }))
  );

  // Keep a ref to the latest fieldArray so the effect below only needs `fields` in its
  // dependency array. The methods (append, remove, etc.) are stable useCallback refs from
  // RHF and don't need to be deps themselves, but we always want the store to hold the
  // current instance.
  const fieldArrayRef = useRef(fieldArray);

  useEffect(() => {
    fieldArrayRef.current = fieldArray;
  }, [fieldArray]);

  useEffect(() => {
    store.setState({ isDisabled: disabledFields, name, control });
  }, [control, disabledFields, name, store]);

  useEffect(() => {
    store.setState(fieldArrayRef.current);
  }, [fieldArray.fields, store]);

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      isInvalid={invalid}
      error={error}
      isDisabled={disabledFields}
    >
      <ArrayFieldContext.Provider value={store as StoreApi<ContextStore>}>
        <RenderContent fields={fieldArray.fields} />
      </ArrayFieldContext.Provider>
    </FieldWrapper>
  );
}

type ArrayFieldAppendProps = PressableProps & {
  defaultValues?: object;
  asChild?: boolean;
};

const ArrayFieldAppend = forwardRef<ComponentRef<typeof View>, ArrayFieldAppendProps>(
  function ArrayFieldAppend({ defaultValues, asChild, ...props }, ref) {
    const append = useArrayFieldContext((s) => s.append);

    const handlePress = useCallback(() => {
      append(defaultValues || {});
    }, [append, defaultValues]);

    const Comp = asChild ? Slot.Pressable : Pressable;

    return <Comp {...props} ref={ref} onPress={handlePress} />;
  }
);

type ArrayFieldRemoveProps = PressableProps & {
  index: number;
  asChild?: boolean;
};

const ArrayFieldRemove = forwardRef<ComponentRef<typeof View>, ArrayFieldRemoveProps>(
  function ArrayFieldRemove({ index, asChild, ...props }, ref) {
    const remove = useArrayFieldContext((s) => s.remove);

    const handlePress = useCallback(() => {
      remove(index);
    }, [remove, index]);

    const Comp = asChild ? Slot.Pressable : Pressable;

    return <Comp {...props} ref={ref} onPress={handlePress} />;
  }
);

ArrayFieldAppend.displayName = 'ArrayFieldAppend';
ArrayFieldRemove.displayName = 'ArrayFieldRemove';

const ArrayField = ArrayFieldComponent as typeof ArrayFieldComponent & {
  Append: typeof ArrayFieldAppend;
  Remove: typeof ArrayFieldRemove;
};

ArrayField.Append = ArrayFieldAppend;
ArrayField.Remove = ArrayFieldRemove;

export type {
  ArrayFieldAppendProps,
  ArrayFieldProps,
  ArrayFieldRemoveProps,
  ArrayFieldRenderProps,
};

export { useArrayFieldContext };
export default ArrayField;

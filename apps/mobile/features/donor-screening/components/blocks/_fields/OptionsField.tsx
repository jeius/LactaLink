import ArrayField, {
  ArrayFieldRenderProps,
  useArrayFieldContext,
} from '@/components/form-fields/ArrayField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { Accordion } from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FlashList, ListRenderItemInfo } from '@/components/ui/FlashList';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { OptionSchema } from '@lactalink/form-schemas/blocks';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useController, type Control } from 'react-hook-form';
import { toast } from 'sonner-native';

type FieldSchema = Exclude<DonorScreeningFormField, { blockType: 'message' }>;

interface FieldProps<T extends FieldSchema> {
  control: Control<T>;
  className?: BaseFieldProps<T>['className'];
  style?: BaseFieldProps<T>['style'];
}

export function OptionsField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <ArrayField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="options"
      label="Options"
      helperText="The list of options that users can choose from. Only applicable for select fields."
      isRequired
      render={OptionsFieldRender}
    />
  );
}

function OptionsFieldRender({ fields, ...props }: ArrayFieldRenderProps) {
  const defaultOption = useMemo<OptionSchema>(() => ({ value: '', label: '' }), []);
  return (
    <VStack {...props} space="md" className="mt-2">
      <Accordion>
        <FlashList
          data={fields}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <Box className="h-3" />}
          renderItem={(props) => <OptionsFieldRenderItem {...props} />}
        />
      </Accordion>

      <ArrayField.Append asChild defaultValues={defaultOption}>
        <Button variant="outline" size="sm">
          <ButtonIcon as={PlusCircleIcon} />
          <ButtonText>Add Option</ButtonText>
        </Button>
      </ArrayField.Append>
    </VStack>
  );
}

function OptionsFieldRenderItem({ index }: ListRenderItemInfo<Record<'_id', string>>) {
  const { control, name } = useArrayFieldContext((s) => ({ control: s.control, name: s.name }));
  const fieldName = `${name}.${index}` as const;

  const {
    field: { value, onChange: onChangeValue },
  } = useController({ control, name: `${fieldName}.value` });

  const {
    field: { value: label, onChange: onChangeLabel },
  } = useController({ control, name: `${fieldName}.value` });

  const prevValueRef = useRef<OptionSchema>(null);

  const handleOnRemove = useCallback(() => {
    toast.info('Option removed', {
      id: `option-remove-${fieldName}`,
      action: {
        label: 'Undo',
        onClick: () => {
          if (prevValueRef.current) {
            onChangeValue(prevValueRef.current.value);
            onChangeLabel(prevValueRef.current.label);
          }
        },
      },
    });
  }, [fieldName, onChangeLabel, onChangeValue]);

  // Keep a snapshot of the current value for the undo action in case of removal
  useEffect(() => {
    prevValueRef.current = { value, label };
  }, [value, label]);

  // Auto-generate option value
  useEffect(() => {
    onChangeValue(`option${index + 1}`);
  }, [fieldName, index, onChangeValue]);

  return (
    <HStack space="md" className="items-center gap-2">
      <TextInputField
        control={control}
        name={`${fieldName}.label`}
        className="flex-1"
        inputProps={{
          placeholder: 'Enter the option',
          autoCapitalize: 'words',
          'aria-label': 'Enter the option',
        }}
      />

      <ArrayField.Remove asChild index={index}>
        <Button
          variant="ghost"
          size="sm"
          action="negative"
          className="h-fit w-fit p-2"
          onPress={handleOnRemove}
        >
          <ButtonIcon as={Trash2Icon} />
        </Button>
      </ArrayField.Remove>
    </HStack>
  );
}

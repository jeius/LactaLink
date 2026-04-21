import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Form, useForm } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { LeaveToastAction } from '@/components/toasts/ToastAction';
import { FlashList } from '@/components/ui/FlashList';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStackProps } from '@/components/ui/vstack';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormSchema, SectionSchema, sectionSchema } from '@lactalink/form-schemas';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { PlusCircleIcon } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import {
  Control,
  FieldArrayPath,
  useFieldArray,
  useFormState,
  useForm as useHookForm,
  useWatch,
} from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { BLOCK_TYPE_LABELS } from '../../lib/constants';
import { BlockSchema, FormCreateSearchParams } from '../../lib/types';
import ArrayFormControl from './ArrayFormControl';
import LinkItem from './LinkItem';
import SelectFieldsSheet from './SelectFieldsSheet';

interface Props extends VStackProps {
  name: FieldArrayPath<DonorScreeningFormSchema>;
}

export default function SectionSheet({ name }: Props) {
  const router = useRouter();
  const { control, setValue } = useForm<DonorScreeningFormSchema>();
  const sectionValues = useWatch({ control, name }) as SectionSchema | undefined;

  const methods = useHookForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: sectionValues,
  });
  const { reset, handleSubmit, getValues } = methods;

  const lastPushedValueRef = useRef({});

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'fields',
    keyName: '_id',
  });

  const { isDirty } = useFormState({ control: methods.control });

  usePreventBackPress(isDirty, showUnsavedWarning);

  const goBack = useCallback(
    (e: GestureResponderEvent) => {
      if (isDirty) {
        e.preventDefault();
        showUnsavedWarning();
      }
    },
    [isDirty]
  );

  const submit = useCallback(() => {
    handleSubmit(async (data) => {
      lastPushedValueRef.current = data;
      reset(data);
      //@ts-expect-error - ignore type issue since we know data is correct
      setValue(name, data, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setTimeout(() => {
        router.back();
      }, 100);
    })();
  }, [handleSubmit, reset, setValue, name, router]);

  useEffect(() => {
    const updateParentFields = debounce(() => {
      const currentValues = getValues();
      lastPushedValueRef.current = currentValues;
      //@ts-expect-error - ignore type issue since we know data is correct
      setValue(name, currentValues, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }, 500);

    updateParentFields();
    return () => updateParentFields.cancel();
  }, [fields, getValues, name, reset, setValue]);

  useEffect(() => {
    const resetFromParent = debounce(() => {
      if (!sectionValues) return;
      if (isEqual(lastPushedValueRef.current, sectionValues)) return;
      // External value update: clear the snapshot and reset.
      lastPushedValueRef.current = {};
      reset(sectionValues, { keepDefaultValues: true });
    }, 500);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [sectionValues, reset]);

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <HStack className="items-center gap-2 px-2 pb-1 pt-4">
        <HeaderBackButton onPress={goBack} />
        <Text size="lg" bold className="flex-1">
          Section
        </Text>
        {isDirty && (
          <Button variant="ghost" className="mr-2" onPress={reset}>
            <ButtonText>Reset</ButtonText>
          </Button>
        )}
      </HStack>

      <Form {...methods}>
        <FlashList
          data={fields}
          keyExtractor={(item) => item._id}
          renderScrollComponent={KeyboardAvoidingScrollView}
          className="flex-1"
          headerClassName="mb-4 gap-6"
          contentContainerClassName="grow p-4"
          footerClassName="mt-4 gap-6 flex-1 justify-between"
          ListHeaderComponent={<ListHeader control={methods.control} />}
          ListFooterComponent={<ListFooter onSelect={append} onConfirm={submit} />}
          ItemSeparatorComponent={() => <Box className="h-4" />}
          renderItem={({ index }) => (
            <RenderItem
              control={methods.control}
              name="fields"
              index={index}
              onRemove={() => remove(index)}
            />
          )}
        />
      </Form>
    </SafeArea>
  );
}

function ListHeader({ control }: { control: Control<SectionSchema> }) {
  return (
    <>
      <TextInputField
        control={control}
        name="title"
        label="Section Title"
        helperText="This will be used as the section header for this group of questions."
        isRequired
      />

      <TextAreaField
        control={control}
        name="description"
        label="Section Description"
        helperText="This will be used as the section description for this group of questions. You can use this to provide additional context or instructions for the questions in this section."
      />

      <ArrayFormControl
        control={control}
        name="fields"
        label="Fields"
        isRequired
        helperText="Add fields that donors will fill out in this section. These fields will be displayed in the order they are listed here."
      />
    </>
  );
}

function ListFooter(props: { onConfirm?: () => void; onSelect?: (field: BlockSchema) => void }) {
  const { onSelect, onConfirm } = props;
  return (
    <>
      <SelectFieldsSheet
        onSelect={onSelect}
        trigger={
          <Button variant="outline" size="sm">
            <ButtonIcon as={PlusCircleIcon} />
            <ButtonText>Add Field</ButtonText>
          </Button>
        }
      />

      <Button onPress={onConfirm}>
        <ButtonText>Save</ButtonText>
      </Button>
    </>
  );
}

type RenderItemProps = {
  onRemove?: () => void;
  index: number;
  name: FieldArrayPath<SectionSchema>;
  control: Control<SectionSchema>;
};

export function RenderItem({ onRemove, name, control, index }: RenderItemProps) {
  const { id, ...searchParams } = useLocalSearchParams();
  const fieldName = `${name}.${index}` as const;

  const value = useWatch({ name: fieldName, control });
  const isBlock = value && 'blockType' in value;
  const title = isBlock
    ? value.label || `Field ${index + 1} - ${BLOCK_TYPE_LABELS[value.blockType]}`
    : `Field ${index + 1}`;

  const params: FormCreateSearchParams = {
    ...searchParams,
    name: searchParams.name + '.' + fieldName,
  };
  const href: Href = {
    pathname: `/donor-screening/form/${id}/field`,
    params: params,
  } as Href;

  return <LinkItem title={title} href={href} onRemove={onRemove} />;
}

function showUnsavedWarning() {
  toast.warning('You have unsaved changes. Are you sure you want to go back?', {
    action: <LeaveToastAction />,
  });
}

import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { useForm } from '@/components/contexts/FormProvider';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { FlashList } from '@/components/ui/FlashList';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { Href, useLocalSearchParams } from 'expo-router';
import { PlusCircleIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Control, FieldArrayPath, useFieldArray, useFormState, useWatch } from 'react-hook-form';
import { BLOCK_TYPE_LABELS } from '../../lib/constants';
import { FormCreateSearchParams } from '../../lib/types';
import ArrayFormControl from './ArrayFormControl';
import LinkItem from './LinkItem';
import SelectFieldsSheet from './SelectFieldsSheet';

const FIELDS_HEADER = 'fieldsHeader';
const FIELDS_FOOTER = 'fieldsFooter';
const SECTIONS_HEADER = 'sectionsHeader';
const SECTIONS_FOOTER = 'sectionsFooter';

export default function ScreeningForm() {
  const { control } = useForm<DonorScreeningFormSchema>();
  const fieldsArray = useFieldArray({ control, name: 'fields', keyName: '_id' });
  const sectionsArray = useFieldArray({ control, name: 'sections', keyName: '_id' });

  const { isSubmitting } = useFormState({ control });

  const data = useMemo(() => {
    const fieldsSection = [
      FIELDS_HEADER,
      ...fieldsArray.fields.map((f, index) => ({ ...f, index })),
      FIELDS_FOOTER,
    ];
    const sectionsSection = [
      SECTIONS_HEADER,
      ...sectionsArray.fields.map((f, index) => ({ ...f, index })),
      SECTIONS_FOOTER,
    ];
    return [...fieldsSection, ...sectionsSection];
  }, [fieldsArray.fields, sectionsArray.fields]);

  return (
    <FlashList
      data={data}
      className="flex-1"
      contentContainerClassName="p-4 grow"
      headerClassName="mb-6"
      renderScrollComponent={KeyboardAvoidingScrollView}
      keyExtractor={(item, idx) => {
        if (typeof item === 'object') return item._id;
        return `${item}-${idx}`;
      }}
      getItemType={(item) => {
        if (typeof item === 'object') {
          if ('blockType' in item) return 'fieldItem';
          return 'sectionItem';
        }
        return item;
      }}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListHeaderComponent={
        <TextInputField
          control={control}
          name="title"
          label="Form Title"
          helperText="This is the title of your donor screening form. It will be displayed to donors when they fill out the form."
          inputProps={{ placeholder: 'Enter a good title...' }}
          contentPosition="middle"
          isRequired
        />
      }
      renderItem={({ item }) => {
        if (item === FIELDS_HEADER) {
          return (
            <ArrayFormControl
              control={control}
              name="fields"
              label="Fields"
              helperText="Add fields that donors will need to fill out when completing the screening form. This will be displayed before the sections. If you want to group fields together, consider adding a section and placing the fields inside the section."
              className="mt-2"
            />
          );
        }

        if (item === FIELDS_FOOTER) {
          return (
            <SelectFieldsSheet
              onSelect={fieldsArray.append}
              trigger={
                <Button size="sm" variant="outline" disablePressAnimation>
                  <ButtonIcon as={PlusCircleIcon} />
                  <ButtonText>Add Field</ButtonText>
                </Button>
              }
            />
          );
        }

        if (item === SECTIONS_HEADER) {
          return (
            <ArrayFormControl
              control={control}
              name="sections"
              label="Sections (Recommended)"
              helperText="Sections are used to group fields together. They can be used to create a multi-step form or to separate different types of questions."
              className="mt-2"
            />
          );
        }

        if (item === SECTIONS_FOOTER) {
          return (
            <Button
              size="sm"
              variant="outline"
              disablePressAnimation
              onPress={() => sectionsArray.append({ fields: [], title: '' })}
            >
              <ButtonIcon as={PlusCircleIcon} />
              <ButtonText>Add Section</ButtonText>
            </Button>
          );
        }

        if (typeof item !== 'object') {
          return null;
        }

        // The item is a section
        const { index } = item;
        const isBlock = 'blockType' in item;
        return (
          <RenderItem
            onRemove={() => (isBlock ? fieldsArray.remove(index) : sectionsArray.remove(index))}
            name={isBlock ? 'fields' : 'sections'}
            control={control}
            index={index}
          />
        );
      }}
    />
  );
}

type RenderItemProps = {
  onRemove?: () => void;
  index: number;
  name: FieldArrayPath<DonorScreeningFormSchema>;
  control: Control<DonorScreeningFormSchema>;
  isDisabled?: boolean;
};

export function RenderItem({ onRemove, name, control, index, isDisabled }: RenderItemProps) {
  const { id, ...searchParams } = useLocalSearchParams();
  const fieldName = `${name}.${index}` as const;
  const value = useWatch({ name: fieldName, control });

  const isBlock = value && 'blockType' in value;
  const isSection = value && 'fields' in value;

  const title = isBlock
    ? value.label
      ? value.label
      : `Field ${index + 1} - ${BLOCK_TYPE_LABELS[value.blockType]}`
    : isSection && value.title
      ? value.title
      : `Section ${index + 1}`;

  const params: FormCreateSearchParams = { ...searchParams, name: fieldName };
  const href: Href = {
    pathname: `/donor-screening/form/${id}/${isBlock ? 'field' : 'section'}`,
    params,
  } as Href;

  return <LinkItem title={title} href={href} onRemove={onRemove} isDisabled={isDisabled} />;
}

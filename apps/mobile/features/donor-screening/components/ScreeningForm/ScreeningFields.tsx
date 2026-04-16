import ArrayField, {
  ArrayFieldRenderProps,
  useArrayFieldContext,
} from '@/components/form-fields/ArrayField';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FlashList, ListRenderItemInfo } from '@/components/ui/FlashList';
import { VStack } from '@/components/ui/vstack';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { BlockSchema } from '@lactalink/form-schemas/blocks';
import isEqual from 'lodash/isEqual';
import { ChevronDownIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import { FC, memo, useMemo } from 'react';
import { Control, FieldArrayPath, useWatch } from 'react-hook-form';
import { BaseBlockProps } from '../blocks/_types';
import CheckboxFieldBlock from '../blocks/CheckboxFieldBlock';
import DateFieldBlock from '../blocks/DateFieldBlock';
import EmailFieldBlock from '../blocks/EmailFieldBlock';
import MultiSelectFieldBlock from '../blocks/MultiSelectFieldBlock';
import NumberFieldBlock from '../blocks/NumberFieldBlock';
import RadioFieldBlock from '../blocks/RadioFieldBlock';
import SelectFieldBlock from '../blocks/SelectFieldBlock';
import TextareaFieldBlock from '../blocks/TextareaFieldBlock';
import TextFieldBlock from '../blocks/TextFieldBlock';
import SelectFieldsSheet from './SelectFieldsSheet';

type IBlockSchema = Exclude<BlockSchema, { blockType: 'message' }>;

interface ScreeningFieldsProps {
  name: FieldArrayPath<DonorScreeningFormSchema>;
  control?: Control<DonorScreeningFormSchema>;
  isRequired?: boolean;
}

const BLOCK_COMPONENTS: Record<IBlockSchema['blockType'], FC<BaseBlockProps<IBlockSchema>>> = {
  text: TextFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  textarea: TextareaFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  checkbox: CheckboxFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  date: DateFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  email: EmailFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  'multi-select': MultiSelectFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  select: SelectFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  radio: RadioFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
  number: NumberFieldBlock as FC<BaseBlockProps<IBlockSchema>>,
};

export default function ScreeningFields({ name, control, isRequired }: ScreeningFieldsProps) {
  return (
    <ArrayField
      name={name}
      control={control}
      contentPosition="last"
      label="Fields"
      helperText="Add fields that donors will need to fill out when completing the screening form."
      render={RenderFields}
      isRequired={isRequired}
    />
  );
}

const MemoizedRenderFieldItem = memo(RenderFieldItem, (prev, next) => isEqual(prev, next));

function RenderFields({ fields, ...props }: ArrayFieldRenderProps) {
  const append = useArrayFieldContext((s) => s.append);

  return (
    <VStack {...props} space="md">
      <Accordion className="mt-1">
        <FlashList
          data={fields}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <Box className="h-3" />}
          renderItem={(props) => <MemoizedRenderFieldItem {...props} />}
        />
      </Accordion>

      <SelectFieldsSheet
        onSelect={append}
        trigger={
          <Button variant="outline" size="sm">
            <ButtonIcon as={PlusCircleIcon} />
            <ButtonText>Add Field</ButtonText>
          </Button>
        }
      />
    </VStack>
  );
}

const MemoizedBlockComponent = memo(BlockComponent, (prev, next) => isEqual(prev, next));

function RenderFieldItem({ index, item }: ListRenderItemInfo<Record<'_id', string>>) {
  const { control, name } = useArrayFieldContext((s) => ({ control: s.control, name: s.name }));

  const fieldName = `${name}.${index}` as const;
  const fieldLabelName = `${fieldName}.label` as const;
  const fieldBlockTypeName = `${fieldName}.blockType` as const;

  const label = useWatch({ control, name: fieldLabelName }) as string | undefined;
  const blockType = useWatch({ control, name: fieldBlockTypeName }) as
    | IBlockSchema['blockType']
    | undefined;

  const title = label || `Field ${index + 1}`;
  const blockProps = { control, name: fieldName } as BaseBlockProps<IBlockSchema>;

  return (
    <AccordionItem
      value={item._id}
      className="overflow-hidden rounded-xl border border-outline-500 bg-background-0"
    >
      <AccordionHeader className="p-0">
        <AccordionTrigger className="gap-2">
          <AccordionTitleText>{title}</AccordionTitleText>

          <ArrayField.Remove asChild index={index}>
            <Button variant="ghost" size="sm" action="negative" className="h-fit w-fit p-2">
              <ButtonIcon as={Trash2Icon} />
            </Button>
          </ArrayField.Remove>

          <AccordionIcon as={ChevronDownIcon} />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent className="px-4">
        {blockType && <MemoizedBlockComponent {...blockProps} blockType={blockType} />}
      </AccordionContent>
    </AccordionItem>
  );
}

function BlockComponent({
  control,
  name,
  blockType,
}: BaseBlockProps<IBlockSchema> & { blockType: IBlockSchema['blockType'] }) {
  const Component = useMemo(() => BLOCK_COMPONENTS[blockType], [blockType]);

  if (!Component) return null;

  return <Component control={control} name={name} />;
}

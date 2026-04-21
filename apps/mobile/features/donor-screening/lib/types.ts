import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { OptionSchema, type BlockSchema as B } from '@lactalink/form-schemas/blocks';
import { type LucideIcon } from 'lucide-react-native';
import type {
  Control,
  DefaultValues,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from 'react-hook-form';
import { type ZodType } from 'zod';

export type FormCreateSearchParams = {
  name?: string;
};

export type BlockSchema = Exclude<B, { blockType: 'message' }>;

export type BlockType = BlockSchema['blockType'];

export type FieldOption = {
  label: string;
  value: BlockType;
  description: string;
  icon: LucideIcon;
};

export type ValueType = 'text' | 'boolean' | 'date' | 'number';

export interface BlockConfig {
  schema: ZodType<BlockSchema, BlockSchema>;
  valueType: ValueType;
  hasPlaceholder: boolean;
  hasOptions: boolean;
  hasDynamicOption: boolean;
  defaultLabel?: string;
  defaultOptions?: OptionSchema[];
}

/** Imperative handle exposed via ref for FieldBlock. */
export interface BlockMethods {
  submit(): void;
  reset(): void;
}

export interface BaseBlockProps<TFieldValues extends FieldValues = BlockSchema> {
  name: FieldPath<DonorScreeningFormSchema>;
  control?: Control<DonorScreeningFormSchema>;
  blockType: BlockType;
  defaultValues?: DefaultValues<TFieldValues>;
  values?: TFieldValues;
  onSubmit?: (values: TFieldValues) => Promise<void>;
  onFormStateChange?: (state: UseFormStateReturn<TFieldValues>) => void;
}

import { BlockSchema } from '@lactalink/form-schemas/blocks';
import type { Control, DefaultValues, FieldPath, FieldValues } from 'react-hook-form';

export type BaseBlockProps<
  TFieldValues extends FieldValues = BlockSchema,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control?: Control<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
};

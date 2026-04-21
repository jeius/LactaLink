import { BasicBadgeProps } from '@/components/badges';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { BlockSchema } from '@/features/donor-screening/lib/types';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { BLOCK_TYPE_LABELS } from '../lib/constants';

type RawField = DonorScreeningFormField;

type FieldType = DonorScreeningFormField['blockType'];

const FIELD_TYPE_BADGE_ACTIONS: Record<FieldType, BasicBadgeProps['action']> = {
  email: 'info',
  text: 'muted',
  textarea: 'muted',
  select: 'success',
  'multi-select': 'success',
  checkbox: 'warning',
  radio: 'warning',
  number: 'info',
  date: 'info',
  message: 'muted',
};

function FieldRow({ field }: { field: BlockSchema }) {
  const typeLabel = BLOCK_TYPE_LABELS[field.blockType] ?? field.blockType;
  const badgeAction = FIELD_TYPE_BADGE_ACTIONS[field.blockType] ?? 'muted';

  return (
    <HStack space="sm" className="items-center">
      <HStack space="xs" className="flex-1 items-center">
        <Text size="sm" className="shrink text-typography-800">
          {field.label}
        </Text>
        {field.required && (
          <Text size="sm" className="text-error-600">
            *
          </Text>
        )}
      </HStack>
      <Badge size="sm" variant="outline" action={badgeAction}>
        <BadgeText>{typeLabel}</BadgeText>
      </Badge>
    </HStack>
  );
}

interface SectionCardProps {
  title: string;
  description?: string | null;
  fields: RawField[];
  /** 1-based section number. Omit for root-level general questions. */
  index?: number;
}

function SectionCard({ title, description, fields, index }: SectionCardProps) {
  const visibleFields = fields.filter(isQuestionField).filter((f) => f.hidden !== true);

  return (
    <Box className="rounded-2xl border border-outline-100 bg-background-0 p-5">
      <VStack space="md">
        <HStack space="md" className="items-start">
          {index !== undefined && (
            <Box className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500">
              <Text bold size="sm" className="text-typography-0">
                {index}
              </Text>
            </Box>
          )}
          <VStack space="xs" className="flex-1">
            <Heading size="sm">{title}</Heading>
            {description && (
              <Text size="sm" className="text-typography-500">
                {description}
              </Text>
            )}
          </VStack>
        </HStack>

        {visibleFields.length > 0 ? (
          <>
            <Divider />
            <VStack space="sm">
              {visibleFields.map((field, i) => (
                <FieldRow key={field.id ?? `${field.name}-${i}`} field={field} />
              ))}
            </VStack>
          </>
        ) : (
          <Text size="sm" className="italic text-typography-400">
            No questions in this section.
          </Text>
        )}
      </VStack>
    </Box>
  );
}

interface ScreeningPreviewProps {
  form: DonorScreeningForm;
}
function ScreeningPreview({ form }: ScreeningPreviewProps) {
  const totalSections = form.sections?.length ?? 0;
  const totalQuestions =
    countVisibleFields(form.fields) +
    (form.sections?.reduce((sum, s) => sum + countVisibleFields(s.fields), 0) ?? 0);

  return (
    <VStack space="lg">
      {/* Stats */}
      <HStack className="rounded-2xl bg-background-100 p-4">
        <VStack space="xs" className="flex-1 items-center">
          <Text bold size="2xl">
            {totalSections}
          </Text>
          <Text size="xs" className="text-typography-500">
            {totalSections === 1 ? 'Section' : 'Sections'}
          </Text>
        </VStack>
        <Divider orientation="vertical" />
        <VStack space="xs" className="flex-1 items-center">
          <Text bold size="2xl">
            {totalQuestions}
          </Text>
          <Text size="xs" className="text-typography-500">
            {totalQuestions === 1 ? 'Question' : 'Questions'}
          </Text>
        </VStack>
      </HStack>

      {/* Root-level fields (outside any section) */}
      {(form.fields?.length ?? 0) > 0 && (
        <SectionCard title="General Questions" fields={form.fields ?? []} />
      )}

      {/* Sections */}
      {form.sections?.map((section, i) => (
        <SectionCard
          key={section.id ?? i}
          index={i + 1}
          title={section.title}
          description={section.description}
          fields={section.fields ?? []}
        />
      ))}
    </VStack>
  );
}

// #region Helpers
/** Narrows away `MessageBlockField`, which lacks label/required/helperText. */
function isQuestionField(field: RawField): field is BlockSchema {
  return field.blockType !== 'message';
}

function countVisibleFields(fields: RawField[] | null | undefined): number {
  return fields?.filter(isQuestionField).filter((f) => f.hidden !== true).length ?? 0;
}
// #endregion

export default ScreeningPreview;

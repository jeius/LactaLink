import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import {
  DonorScreeningForm,
  DonorScreeningSubmission,
} from '@lactalink/types/payload-generated-types';
import { useMemo } from 'react';

const emptyLabel = 'N/A';

interface SubmissionSummaryProps {
  data: NonNullable<DonorScreeningSubmission['submissionData']>;
  form: DonorScreeningForm;
}

type NamedField = Exclude<DonorScreeningFormField, { blockType: 'message' }>;

type TopLevelNamedField = Exclude<
  NonNullable<DonorScreeningForm['fields']>[number],
  { blockType: 'message' }
>;

interface FieldAnswerRowProps {
  label: string;
  valueLabel?: string;
}

export default function SubmissionSummary({ data, form }: SubmissionSummaryProps) {
  const answerMap = useMemo(
    () =>
      new Map(data.map(({ field, valueLabel }) => [field, JSON.parse(valueLabel) || emptyLabel])),
    [data]
  );

  const { sections, fields } = form;

  return (
    <VStack space="2xl">
      {/* Sectioned fields */}
      {sections &&
        sections.map((section, index) => (
          <VStack key={section.id ?? index} space="md">
            {/* Section header */}
            <HStack space="md" className="items-center">
              <Box className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500">
                <Text bold size="sm" className="text-typography-0">
                  {index + 1}
                </Text>
              </Box>
              <Heading size="md">{section.title}</Heading>
            </HStack>

            <Divider />

            {/* Section answers */}
            <VStack space="sm">
              {section.fields
                ?.filter(isNamedField)
                .filter((f) => !f.hidden)
                .map((field, fieldIndex) => (
                  <FieldAnswerRow
                    key={field.id ?? fieldIndex}
                    label={field.label}
                    valueLabel={answerMap.get(field.name)}
                  />
                ))}
            </VStack>
          </VStack>
        ))}

      {/* Top-level fields (outside any section) */}
      {fields && fields.length > 0 && (
        <VStack space="sm">
          {fields
            .filter(isTopLevelNamedField)
            .filter((f) => !f.hidden)
            .map((field, index) => (
              <FieldAnswerRow
                key={field.id ?? index}
                label={field.label}
                valueLabel={answerMap.get(field.name)}
              />
            ))}
        </VStack>
      )}
    </VStack>
  );
}

// #region Helpers

function isNamedField(f: DonorScreeningFormField): f is NamedField {
  return f.blockType !== 'message';
}

function isTopLevelNamedField(
  f: NonNullable<DonorScreeningForm['fields']>[number]
): f is TopLevelNamedField {
  return f.blockType !== 'message';
}

function FieldAnswerRow({ label, valueLabel }: FieldAnswerRowProps) {
  return (
    <Box className="rounded-xl bg-background-50 p-3">
      <VStack space="xs">
        <Text bold>{label}</Text>
        <Text className="text-typography-600">{valueLabel ?? emptyLabel}</Text>
      </VStack>
    </Box>
  );
}
// #endregion

import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Form } from '@/components/contexts/FormProvider';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { FlashList } from '@/components/ui/FlashList';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { getColor } from '@/lib/colors';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import isEqual from 'lodash/isEqual';
import { memo } from 'react';
import { useScreeningForm } from '../../hooks/useScreeningForm';
import ScreeningFields from './ScreeningFields';
import ScreeningSections from './ScreeningSections';

const MemoizedScreeningFields = memo(ScreeningFields, (prev, next) => isEqual(prev, next));
const MemoizedScreeningSections = memo(ScreeningSections, (prev, next) => isEqual(prev, next));

interface ScreeningFormProps {
  form?: DonorScreeningForm | null;
}

export default function ScreeningForm({ form }: ScreeningFormProps) {
  const methods = useScreeningForm(form);
  const { control } = methods;

  return (
    <Form {...methods}>
      <HStack space="md" className="items-center justify-between px-2 pb-2">
        <HeaderBackButton tintColor={getColor('typography', '900')} />

        <Button className="mr-2">
          <ButtonText>Submit</ButtonText>
        </Button>
      </HStack>

      <FlashList
        data={['fields', '']}
        contentContainerClassName="p-4"
        headerClassName="mb-6"
        ItemSeparatorComponent={() => <Box className="h-6" />}
        ListHeaderComponent={
          <TextInputField
            control={control}
            name="title"
            label="Form Title"
            helperText="This is the title of your donor screening form. It will be displayed to donors when they fill out the form."
            inputProps={{ placeholder: 'Enter a good title...' }}
            contentPosition="first"
            isRequired
          />
        }
        renderItem={({ item }) => {
          if (!item) {
            return <MemoizedScreeningSections control={control} />;
          }

          return <MemoizedScreeningFields control={control} name="fields" />;
        }}
      />
    </Form>
  );
}

import { Form } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import {
  AddAttachmentButton,
  CameraButton,
  ImagePickerButton,
} from '@/features/feed/components/add-buttons';
import MediaList from '@/features/feed/components/MediaList';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema } from '@lactalink/form-schemas';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function FeedCreatePage() {
  const [offset, setOffset] = useState(0);

  const methods = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      title: '',
    },
  });

  const { handleSubmit, control } = methods;

  return (
    <Form {...methods}>
      <SafeArea mode="margin" safeTop={false} className="items-stretch justify-start">
        <KeyboardAvoidingScrollView
          className="flex-1"
          keyboardVerticalOffset={offset}
          contentContainerClassName="grow"
        >
          <VStack space="xl" className="flex-1 p-4">
            <TextInputField
              control={control}
              name="title"
              label="Title"
              inputProps={{ placeholder: 'Enter title' }}
            />
            <TextAreaField
              control={control}
              name="content"
              label="Content"
              textareaProps={{ placeholder: 'Enter content', containerClassName: 'h-40' }}
            />
          </VStack>

          <MediaList />
        </KeyboardAvoidingScrollView>

        <VStack
          space="md"
          onLayout={(e) => setOffset(e.nativeEvent.layout.height)}
          className="border-outline-200 px-4 pt-2"
          style={{ borderTopWidth: 1 }}
        >
          <HStack space="sm" className="items-center">
            <ImagePickerButton />
            <CameraButton />
            <AddAttachmentButton />
          </HStack>
          <Button>
            <ButtonText>Post</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    </Form>
  );
}

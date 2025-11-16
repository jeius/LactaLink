import { Form } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema } from '@lactalink/form-schemas';
import { CameraIcon, ImageIcon, PaperclipIcon } from 'lucide-react-native';
import React from 'react';
import { useForm } from 'react-hook-form';

export default function FeedCreatePage() {
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
      <SafeArea mode="margin" safeTop={false} className="items-stretch justify-start py-4">
        <VStack space="xl" className="flex-1 px-4">
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

        <VStack space="md" className="border-outline-200 px-4 pt-2" style={{ borderTopWidth: 1 }}>
          <HStack space="sm" className="items-center">
            <Pressable className="overflow-hidden rounded-xl p-2">
              <Icon as={ImageIcon} size="2xl" className="text-primary-700" />
            </Pressable>
            <Pressable className="overflow-hidden rounded-xl p-2">
              <Icon as={CameraIcon} size="2xl" className="text-primary-700" />
            </Pressable>
            <Pressable className="overflow-hidden rounded-xl p-2">
              <Icon as={PaperclipIcon} size="2xl" className="text-primary-700" />
            </Pressable>
          </HStack>
          <Button>
            <ButtonText>Post</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    </Form>
  );
}

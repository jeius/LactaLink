import { Form } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import {
  AddAttachmentButton,
  CameraButton,
  ImagePickerButton,
} from '@/features/feed/components/post-create/add-buttons';
import Attachment from '@/features/feed/components/post-create/Attachment';
import MediaList from '@/features/feed/components/post-create/MediaList';
import { useAddPostMutation } from '@/features/feed/hooks/useAddPostMutation';
import { uploadImage } from '@/lib/api/file';
import { getMeUser } from '@/lib/stores/meUserStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostSchema, postSchema } from '@lactalink/form-schemas';
import { MediaAttachment } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { randomUUID } from 'expo-crypto';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function FeedCreatePage() {
  const [offset, setOffset] = useState(0);
  const { mutate: createPost } = useAddPostMutation();
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      title: '',
    },
  });

  const { handleSubmit, control } = methods;

  async function onSubmit(data: PostSchema) {
    const meUser = getMeUser();
    const profile = meUser?.profile;

    if (!profile) {
      throw new Error('User profile not found');
    }

    const create = async () => {
      const attachments =
        data.media &&
        (await Promise.all(
          data.media.map(async ({ image, caption }) => {
            const uploadedImage = await uploadImage('images', image);
            return { image: uploadedImage, caption, mediaType: 'IMAGE' } as MediaAttachment;
          })
        ));

      createPost({
        id: `temp-${randomUUID()}`,
        title: data.title,
        content: data.content,
        attachments: attachments,
        author: profile,
        visibility: 'PUBLIC',
        sharedFrom: data.sharedFrom,
        tags: data.tags?.map((tag) => ({ tag })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    };

    const promise = create();
    toast.promise(promise, {
      loading: 'Creating post...',
      success: () => 'Post created successfully!',
      error: (err) => `Error creating post: ${extractErrorMessage(err)}`,
    });

    await promise;
    router.back();
  }

  return (
    <Form {...methods}>
      <SafeArea mode="margin" safeTop={false} className="items-stretch justify-start">
        <KeyboardAvoidingScrollView
          className="flex-1"
          keyboardVerticalOffset={offset}
          contentContainerClassName="grow"
        >
          <VStack space="xl" className="flex-1 p-4">
            <TextAreaField
              control={control}
              name="title"
              label="Title"
              textareaProps={{
                placeholder: 'Briefly describe your post',
                containerClassName: 'h-16',
              }}
            />
            <TextAreaField
              control={control}
              name="content"
              label="Content"
              textareaProps={{
                placeholder: 'What do you want to share?',
                containerClassName: 'h-52',
              }}
            />
          </VStack>

          <MediaList />

          <Attachment />
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
          <Button onPress={handleSubmit(onSubmit)}>
            <ButtonText>Post</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    </Form>
  );
}

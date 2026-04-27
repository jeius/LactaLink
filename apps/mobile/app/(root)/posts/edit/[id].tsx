import { Form } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import {
  AddAttachmentButton,
  CameraButton,
  ImagePickerButton,
} from '@/features/feed/components/post-create/add-buttons';
import Attachment from '@/features/feed/components/post-create/Attachment';
import MediaList from '@/features/feed/components/post-create/MediaList';
import { useUpdatePostMutation } from '@/features/feed/hooks/mutations';
import { usePostForm } from '@/features/feed/hooks/usePostForm';
import { shadow } from '@/lib/utils/shadows';
import { PostSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function EditPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [offset, setOffset] = useState(0);
  const router = useRouter();

  const methods = usePostForm(id);
  const { handleSubmit, control } = methods;

  const { mutateAsync: updatePostAsync, isPending } = useUpdatePostMutation(id!);

  async function onSubmit(data: PostSchema) {
    const toastID = 'edit-post-toast';

    toast.loading('Saving post...', { id: toastID, cancel: null });
    await updatePostAsync({ data }).then(
      () => {
        toast.success('Post updated successfully!', { id: toastID });
        router.back();
      },
      (err) => {
        toast.error(`Error updating post: ${extractErrorMessage(err)}`, { id: toastID });
      }
    );
  }

  return (
    <Form {...methods}>
      <SafeArea mode="margin" safeTop={false} className="items-stretch justify-start">
        <HStack
          space="sm"
          className="items-center bg-background-0 px-2 py-1"
          style={{ paddingTop: insets.top + 4, ...shadow.sm }}
        >
          <HStack space="lg" className="flex-1 items-center">
            <HeaderBackButton />
            <Heading size="xl">Edit Post</Heading>
          </HStack>
          <ActionModal
            action="primary"
            title="Submit Post"
            description="Are you sure you want to submit this post?"
            triggerButtonProps={{
              label: isPending ? 'Submitting...' : 'Submit',
              size: 'md',
              isDisabled: isPending,
              isLoading: isPending,
              className: 'mr-2',
            }}
            confirmButtonProps={{ label: 'Submit' }}
            onConfirm={() => {
              handleSubmit(onSubmit)();
            }}
          />
        </HStack>

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
              isDisabled={isPending}
              textareaProps={{
                placeholder: 'Briefly describe your post',
                containerClassName: 'h-24',
              }}
            />
            <TextAreaField
              control={control}
              name="content"
              label="Content"
              isDisabled={isPending}
              textareaProps={{
                placeholder: 'What do you want to share?',
                containerClassName: 'h-52',
              }}
            />
          </VStack>

          <Box pointerEvents={isPending ? 'none' : 'auto'} style={{ opacity: isPending ? 0.5 : 1 }}>
            <MediaList />
          </Box>
        </KeyboardAvoidingScrollView>

        <VStack onLayout={(e) => setOffset(e.nativeEvent.layout.height)}>
          <Box pointerEvents={isPending ? 'none' : 'auto'} style={{ opacity: isPending ? 0.5 : 1 }}>
            <Attachment />
          </Box>

          <HStack
            space="sm"
            className="items-center border-outline-200 px-4 pt-2"
            style={{ borderTopWidth: 1 }}
          >
            <ImagePickerButton />
            <CameraButton />
            <AddAttachmentButton />
          </HStack>
        </VStack>
      </SafeArea>
    </Form>
  );
}

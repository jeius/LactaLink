import { Box } from '@/components/ui/box';
import CommentsSheet from '@/features/feed/components/CommentsSheet';
import { FeedCommentsSearchParams } from '@/lib/types/searchParams';
import { ErrorSearchParams } from '@lactalink/types/errors';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommentsSheetPage() {
  const { post } = useLocalSearchParams<FeedCommentsSearchParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!post) {
    const params: ErrorSearchParams = {
      title: 'Missing Post ID',
      message: 'No post ID was provided to load comments.',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <>
      <Box className="flex-1">
        <CommentsSheet
          post={{ id: post }}
          defaultOpen
          onClose={router.back}
          snapPoints={['100']}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      </Box>
    </>
  );
}

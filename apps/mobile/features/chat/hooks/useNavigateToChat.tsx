import { User } from '@lactalink/types/payload-generated-types';
import { Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useFindDirectChat } from './queries';

export function useNavigateToChat(user: string | User | null | undefined) {
  const router = useRouter();
  const { data: conversation, isPlaceholderData } = useFindDirectChat(user);

  const navigate = useCallback(
    (type: 'push' | 'replace' = 'push') => {
      if (!conversation || isPlaceholderData) return;

      const href: Href = `/chat/${conversation.id}`;

      if (type === 'push') router.push(href);
      else router.replace(href);
    },
    [conversation, isPlaceholderData, router]
  );

  return navigate;
}

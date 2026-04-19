import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Href, useRouter } from 'expo-router';
import { Trash2Icon } from 'lucide-react-native';

interface LinkItemProps {
  title: string;
  href?: Href;
  onRemove?: () => void;
}

export default function LinkItem({ title, href, onRemove }: LinkItemProps) {
  const router = useRouter();

  function handlePress() {
    if (href) router.push(href);
  }

  return (
    <Pressable
      aria-label={title}
      className="overflow-hidden rounded-xl border border-outline-500 bg-background-0 px-4 py-3"
      onPress={handlePress}
    >
      <HStack space="sm" className="items-center">
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {title}
        </Text>

        <Button
          variant="ghost"
          size="sm"
          action="negative"
          className="h-fit w-fit p-3"
          onPress={onRemove}
        >
          <ButtonIcon as={Trash2Icon} />
        </Button>
      </HStack>
    </Pressable>
  );
}

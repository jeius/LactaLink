import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack, VStackProps } from '@/components/ui/vstack';

interface Props extends VStackProps {
  isLoading?: boolean;
  content: string;
  title: string;
  placeholder?: string;
}

export default function TextAreaBlock({
  isLoading,
  title,
  content,
  placeholder = 'Nothing provided.',
  ...props
}: Props) {
  return (
    <VStack {...props}>
      <Text className="mb-1 font-JakartaSemiBold">{title}</Text>
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <Textarea className="h-32 border-0" pointerEvents="none">
          <TextareaInput
            defaultValue={content}
            placeholder={placeholder}
            editable={false}
            style={{ textAlignVertical: 'top' }}
          />
        </Textarea>
      )}
    </VStack>
  );
}

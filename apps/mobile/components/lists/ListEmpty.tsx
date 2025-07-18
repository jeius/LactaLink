import { getImageAsset } from '@/lib/stores';
import { AssetObject } from '@/lib/types';
import { Image } from '../Image';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface ListEmptyProps {
  title?: string;
  description?: string;
  imageName?: keyof AssetObject['images'];
  hideImage?: boolean;
}

export function ListEmpty({ title, description, imageName = 'noData', hideImage }: ListEmptyProps) {
  return (
    <VStack space="xs" className="flex-1 items-center justify-center">
      {!hideImage && (
        <Image
          alt="No Data"
          source={getImageAsset(imageName)}
          style={{ width: '75%', aspectRatio: 1.75, marginBottom: 10 }}
          contentFit="contain"
        />
      )}
      <Text size="lg" className="font-JakartaSemiBold">
        {title || 'No Data Available'}
      </Text>
      {description && <Text className="text-typography-700">{description}</Text>}
    </VStack>
  );
}

import { getImageAsset } from '@/lib/stores';
import { AssetObject } from '@/lib/types';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Image } from './Image';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const defaultClassName = tva({
  base: 'flex-1 items-center justify-center',
});

interface NoDataProps extends React.ComponentProps<typeof VStack> {
  title?: string;
  description?: string;
  imageName?: keyof AssetObject['images'];
  hideImage?: boolean;
}

export function NoData({
  title,
  description,
  imageName = 'noData',
  hideImage,
  space = 'xs',
  ...props
}: NoDataProps) {
  return (
    <VStack {...props} space={space} className={defaultClassName({ className: props.className })}>
      {!hideImage && (
        <Image
          alt="No Data"
          source={getImageAsset(imageName)}
          style={{ width: '85%', aspectRatio: 1.75, marginBottom: 16 }}
          contentFit="contain"
        />
      )}
      <Text size="lg" className="text-center font-JakartaSemiBold">
        {title || 'No Data Available'}
      </Text>
      {description && <Text className="text-center text-typography-700">{description}</Text>}
    </VStack>
  );
}

import { Box } from '@/components/ui/box';
import { Image, ImageProps } from '@/components/ui/image';
import { Popover, PopoverBackdrop, PopoverBody, PopoverContent } from '@/components/ui/popover';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryMode } from '@lactalink/types';
import { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

const containerStyles = tva({
  base: 'items-center',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    space: 'sm',
  },
});

interface DeliveryModeIconsProps
  extends VariantProps<typeof containerStyles>, Pick<ImageProps, 'size'> {
  modes: DeliveryMode[];
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function DeliveryModeIcons({
  modes,
  size = 'md',
  orientation = 'horizontal',
  space = 'sm',
  containerClassName,
  containerStyle,
}: DeliveryModeIconsProps) {
  if (!modes?.length) return null;

  return (
    <Box
      style={containerStyle}
      className={containerStyles({ orientation, space, className: containerClassName })}
    >
      {modes.map((mode, index) => {
        const iconAsset = getDeliveryPreferenceIcon(mode);
        return (
          <Popover
            key={index}
            placement="bottom"
            offset={8}
            trigger={(props) => (
              <Pressable
                {...props}
                className="overflow-hidden rounded-full border border-primary-500 p-1"
              >
                <Image source={iconAsset as ImageSourcePropType} alt={`${mode}-icon`} size={size} />
              </Pressable>
            )}
          >
            <PopoverBackdrop />
            <PopoverContent size="sm" className="p-3">
              <PopoverBody>
                <Text size="sm" className="font-JakartaMedium">
                  {DELIVERY_OPTIONS[mode].label}
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        );
      })}
    </Box>
  );
}

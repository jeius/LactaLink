import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryMode } from '@lactalink/types';
import { Image } from './Image';
import { Popover, PopoverBody, PopoverContent, PopoverProps } from './ui/popover';
import { Pressable } from './ui/pressable';
import { Text, TextProps } from './ui/text';

import { useRecyclingState } from '@shopify/flash-list';
import { randomUUID } from 'expo-crypto';
import { Modal } from 'react-native';

interface BaseProps {
  textSize?: TextProps['size'];
  placement?: PopoverProps['placement'];
  offset?: PopoverProps['offset'];
  recyclingKey?: string | number;
}

function ModeIcon({
  mode,
  textSize = 'md',
  placement = 'bottom',
  offset = 8,
  recyclingKey = randomUUID(),
}: { mode: DeliveryMode } & BaseProps) {
  const [isOpen, setIsOpen] = useRecyclingState(false, [recyclingKey]);
  const iconAsset = getDeliveryPreferenceIcon(mode);

  return (
    <Popover
      placement={placement}
      offset={offset}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      trigger={(props) => (
        <Pressable {...props} className="overflow-hidden rounded-full bg-primary-0 p-2">
          <Image source={iconAsset} alt={`${mode}-icon`} style={{ width: 26, height: 26 }} />
        </Pressable>
      )}
    >
      <Modal transparent visible={isOpen}>
        <Pressable
          android_ripple={{ color: null }}
          className="absolute inset-0"
          onPress={() => setIsOpen(false)}
        />

        <PopoverContent size="sm" className="p-3">
          <PopoverBody>
            <Text size={textSize} className="font-JakartaMedium">
              {DELIVERY_OPTIONS[mode].label}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Modal>
    </Popover>
  );
}

function DeliveryModeIcons({ modes, ...props }: { modes: DeliveryMode[] } & BaseProps) {
  if (!modes?.length) return null;

  return modes.map((mode, idx) => <ModeIcon {...props} key={`${mode}-${idx}`} mode={mode} />);
}

export { ModeIcon as DeliveryModeIcon };

export default DeliveryModeIcons;

import { isDeviceTablet } from '@/lib/utils/getDeviceType';
import { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { ComponentRef, forwardRef, useEffect, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { boxContainerStyle, boxStyle } from './styles';

// Mobile-like max width (e.g., iPhone 14 Pro max width is approx 430dp)
const mobileMaxWidth = 430;

type IBoxProps = ViewProps &
  VariantProps<typeof boxStyle> & {
    className?: string;
    containerClassName?: string;
    containerStyle?: ViewProps['style'];
  };

const LetterBox = forwardRef<ComponentRef<typeof View>, IBoxProps>(function LetterBox(
  { children, className, containerClassName, style, containerStyle },
  ref
) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    isDeviceTablet().then((isTab) => setIsTablet(isTab));
  }, []);

  return (
    <View
      style={containerStyle}
      className={boxContainerStyle({ className: containerClassName, isTablet })}
    >
      <View
        ref={ref}
        className={boxStyle({ className })}
        style={[style, isTablet && { width: mobileMaxWidth, maxWidth: mobileMaxWidth }]}
      >
        {children}
      </View>
    </View>
  );
});

export default LetterBox;

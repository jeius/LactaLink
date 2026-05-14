import { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { ComponentRef, forwardRef } from 'react';
import { useWindowDimensions, View, ViewProps } from 'react-native';
import { boxContainerStyle, boxStyle } from './styles';

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
  const { width } = useWindowDimensions();

  // Define tablet threshold (standard is often 768dp)
  const isTablet = width >= 768;

  // Mobile-like max width (e.g., iPhone 14 Pro max width is approx 430dp)
  const mobileMaxWidth = 430;

  return (
    <View style={containerStyle} className={boxContainerStyle({ className: containerClassName })}>
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

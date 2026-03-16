import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { LinearGradient as ExpoLinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { ComponentRef, forwardRef } from 'react';

const StyledExpoLinearGradient = cssInterop(ExpoLinearGradient, { className: 'style' });

const linearGradientStyle = tva({
  base: '',
});

const LinearGradient = forwardRef<ComponentRef<typeof ExpoLinearGradient>, LinearGradientProps>(
  function LinearGradient({ className, ...props }, ref) {
    return (
      <StyledExpoLinearGradient
        {...props}
        className={linearGradientStyle({ class: className })}
        // @ts-expect-error - No ref property in Expo's LinearGradient, but still want to forward
        // it for potential use cases
        ref={ref}
      />
    );
  }
);

LinearGradient.displayName = 'LinearGradient';

export type { LinearGradientProps };
export default LinearGradient;

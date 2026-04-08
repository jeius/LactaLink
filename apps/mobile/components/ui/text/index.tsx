import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react';
import { Text as RNText } from 'react-native';
import { textStyle } from './styles';

type ITextProps = ComponentPropsWithoutRef<typeof RNText> & VariantProps<typeof textStyle>;

const Text = forwardRef<ComponentRef<typeof RNText>, ITextProps>(function Text(
  {
    className,
    isTruncated,
    bold,
    underline,
    strikeThrough,
    size = 'md',
    sub,
    italic,
    highlight,
    ...props
  },
  ref
) {
  return (
    <RNText
      className={textStyle({
        isTruncated,
        bold,
        underline,
        strikeThrough,
        size,
        sub,
        italic,
        highlight,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
});

Text.displayName = 'Text';

export { Text };
export type { ITextProps as TextProps };

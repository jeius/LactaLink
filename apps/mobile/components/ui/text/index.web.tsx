import React from 'react';
import { StyleSheet } from 'react-native';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { textStyle } from './styles';

type ITextProps = React.ComponentProps<'span'> & VariantProps<typeof textStyle>;

const Text = React.forwardRef<React.ComponentRef<'span'>, ITextProps>(function Text(
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
  }: { className?: string } & ITextProps,
  ref
) {
  const {
    style,
    numberOfLines,
    ellipsizeMode: _ellipsizeMode,
    onLayout: _onLayout,
    nativeID,
    forwardedRef: _forwardedRef,
    ...webProps
  } = props as typeof props & {
    ellipsizeMode?: unknown;
    forwardedRef?: unknown;
    nativeID?: string;
    numberOfLines?: number;
    onLayout?: unknown;
  };
  const lineClampStyle: React.CSSProperties | undefined = numberOfLines
    ? {
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: numberOfLines,
      }
    : undefined;
  return (
    <span
      {...webProps}
      id={nativeID ?? webProps.id}
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
      style={{ ...(StyleSheet.flatten(style) as React.CSSProperties), ...lineClampStyle }}
      ref={ref}
    />
  );
});

Text.displayName = 'Text';

export { Text };

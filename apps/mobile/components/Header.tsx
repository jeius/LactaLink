import { shadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React, { createElement, FC } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './AppProvider/ThemeProvider';
import { HeaderBackButton } from './HeaderBackButton';
import { Box, BoxProps } from './ui/box';
import { Text, TextProps } from './ui/text';

const boxStyle = tva({
  base: 'absolute inset-x-0 top-0 z-50 bg-primary-500',
});

const contentBoxStyle = tva({
  base: 'flex-row items-center gap-2 px-4 py-3',
});

const textStyle = tva({
  base: 'grow font-JakartaSemiBold',
});

export type HeaderRightProps = ViewProps & { tintColor?: string };
export type HeaderLeftProps = ViewProps & { tintColor?: string };

export interface HeaderProps extends BoxProps {
  title?: string;
  headerLeft?: FC<HeaderLeftProps>;
  headerRight?: FC<HeaderRightProps>;
  headerLeftStyle?: ViewProps['style'];
  headerLeftClassName?: ViewProps['className'];
  headerRightStyle?: ViewProps['style'];
  headerRightClassName?: ViewProps['className'];
  contentContainerStyle?: ViewProps['style'];
  contentContainerClassName?: ViewProps['className'];
  headerTextProps?: TextProps;
  tintColor?: string;
  hideBackButton?: boolean;
  hideShadow?: boolean;
}

export function Header({
  title,
  headerLeft,
  headerRight,
  headerLeftStyle,
  headerLeftClassName,
  headerRightStyle,
  headerRightClassName,
  contentContainerStyle,
  contentContainerClassName,
  headerTextProps: textProps,
  tintColor,
  className,
  style,
  hideBackButton = false,
  hideShadow = false,
  ...boxProps
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { themeColors } = useTheme();
  const resolvedTintColor = tintColor || themeColors.primary[0];

  return (
    <Box
      {...boxProps}
      className={boxStyle({ className })}
      style={[{ paddingTop: insets.top }, !hideShadow ? shadow.md : {}, StyleSheet.flatten(style)]}
    >
      <Box
        className={contentBoxStyle({ className: contentContainerClassName })}
        style={contentContainerStyle}
      >
        {headerLeft
          ? createElement(headerLeft, {
              style: headerLeftStyle,
              className: headerLeftClassName,
              tintColor: resolvedTintColor,
            })
          : !hideBackButton && (
              <HeaderBackButton
                className={headerLeftClassName}
                style={headerLeftStyle}
                tintColor={resolvedTintColor}
              />
            )}

        {title ? (
          <Text
            {...textProps}
            numberOfLines={textProps?.numberOfLines ?? 1}
            className={textStyle({ className: textProps?.className })}
            style={StyleSheet.flatten([{ color: resolvedTintColor }, textProps?.style])}
          >
            {title}
          </Text>
        ) : (
          <Box className="grow" />
        )}

        {headerRight &&
          createElement(headerRight, {
            style: headerRightStyle,
            className: headerRightClassName,
            tintColor: resolvedTintColor,
          })}
      </Box>
    </Box>
  );
}

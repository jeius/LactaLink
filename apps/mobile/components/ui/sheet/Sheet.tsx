import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import {
  DidBlurEvent,
  DidDismissEvent,
  DidFocusEvent,
  DidPresentEvent,
  TrueSheet,
  TrueSheetProps,
} from '@lodev09/react-native-true-sheet';
import { cssInterop } from 'nativewind';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SheetRef = TrueSheet;

export type SheetProps = TrueSheetProps;

const Sheet = React.forwardRef<SheetRef, SheetProps>(function Sheet(props, externalRef) {
  const insets = useSafeAreaInsets();
  const localRef = useRef<SheetRef>(null);
  const ref = externalRef ?? localRef;

  const { themeColors } = useTheme();
  const backgroundColor = themeColors.background[0];
  const primaryColor = themeColors.primary[500];

  const presentedRef = useRef(false);
  const focusRef = useRef(false);

  const handleOnDidDismiss = (e: DidDismissEvent) => {
    props.onDidDismiss?.(e);
    if (e.defaultPrevented) return;
    presentedRef.current = false;
  };

  const handleOnDidPresent = (e: DidPresentEvent) => {
    props.onDidPresent?.(e);
    if (e.defaultPrevented) return;
    presentedRef.current = true;
  };

  const handleOnDidFocus = (e: DidFocusEvent) => {
    props.onDidFocus?.(e);
    if (e.defaultPrevented) return;
    focusRef.current = true;
  };

  const handleOnDidBlur = (e: DidBlurEvent) => {
    props.onDidBlur?.(e);
    if (e.defaultPrevented) return;
    focusRef.current = false;
  };

  usePreventBackPress(presentedRef, () => {
    if (focusRef.current && typeof ref === 'object' && ref) ref.current?.dismiss();
  });

  return (
    <TrueSheet
      {...props}
      ref={ref}
      style={StyleSheet.flatten([{ paddingBottom: insets.bottom }, props.style])}
      backgroundColor={props.backgroundColor ?? backgroundColor}
      cornerRadius={props.cornerRadius ?? 24}
      header={props.header ?? <View />}
      headerStyle={StyleSheet.flatten([{ paddingTop: 30 }, props.headerStyle])}
      onDidDismiss={handleOnDidDismiss}
      onDidPresent={handleOnDidPresent}
      onDidFocus={handleOnDidFocus}
      onDidBlur={handleOnDidBlur}
      insetAdjustment={props.insetAdjustment ?? 'never'}
      grabberOptions={{
        color: primaryColor,
        adaptive: false,
        ...props.grabberOptions,
      }}
    />
  );
});

cssInterop(Sheet, { className: 'style' });

export default Sheet;

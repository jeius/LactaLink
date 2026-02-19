import { useTheme } from '@/components/AppProvider/ThemeProvider';
import {
  DidBlurEvent,
  DidDismissEvent,
  DidFocusEvent,
  DidPresentEvent,
  TrueSheet,
  TrueSheetProps,
} from '@lodev09/react-native-true-sheet';
import { useFocusEffect } from 'expo-router';
import { cssInterop } from 'nativewind';
import React, { useCallback, useRef } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SheetRef = TrueSheet;

export type SheetProps = TrueSheetProps;

const Sheet = React.forwardRef<SheetRef, SheetProps>(function Sheet(props, ref) {
  const insets = useSafeAreaInsets();

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

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (focusRef.current && presentedRef.current) {
          if (typeof ref === 'object' && ref) ref.current?.dismiss();
          return true;
        }
        return false;
      });

      return () => subscription.remove();
    }, [ref])
  );

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

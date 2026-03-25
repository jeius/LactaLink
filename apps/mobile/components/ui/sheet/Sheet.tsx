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
import React, { ComponentPropsWithoutRef, ForwardedRef, RefObject, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetRef = TrueSheet;

const Sheet = React.forwardRef<SheetRef, TrueSheetProps>(function Sheet(props, ref) {
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
    >
      <BackHandler sheetRef={ref} presentedRef={presentedRef} focusRef={focusRef} />
      {props.children}
    </TrueSheet>
  );
});

const StyledSheet = cssInterop(Sheet, {
  className: 'style',
  headerClassName: 'headerStyle',
  footerClassName: 'footerStyle',
  backgroundColorClassName: {
    target: 'backgroundColor',
    nativeStyleToProp: { backgroundColor: true },
  },
  cornerRadiusClassName: {
    target: 'cornerRadius',
    nativeStyleToProp: { borderRadius: 'cornerRadius' },
  },
});

type SheetProps = ComponentPropsWithoutRef<typeof StyledSheet>;

export type { SheetProps, SheetRef };

export default StyledSheet;

// Helper component to handle back button presses when the sheet is open
function BackHandler({
  sheetRef,
  presentedRef,
  focusRef,
}: {
  sheetRef: ForwardedRef<SheetRef>;
  presentedRef: RefObject<boolean>;
  focusRef: RefObject<boolean>;
}) {
  usePreventBackPress(presentedRef, () => {
    if (typeof sheetRef !== 'object' || !sheetRef) return;
    if (focusRef.current) sheetRef.current?.dismiss();
  });

  return null;
}

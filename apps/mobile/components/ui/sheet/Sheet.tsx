import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SheetRef = React.ComponentRef<typeof TrueSheet>;

export type SheetProps = TrueSheetProps;

export default function Sheet(props: SheetProps) {
  const insets = useSafeAreaInsets();

  const { themeColors } = useTheme();
  const backgroundColor = themeColors.background[0];
  const primaryColor = themeColors.primary[500];

  return (
    <TrueSheet
      {...props}
      style={StyleSheet.flatten([{ paddingBottom: insets.bottom }, props.style])}
      backgroundColor={props.backgroundColor ?? backgroundColor}
      cornerRadius={props.cornerRadius ?? 24}
      header={props.header ?? <View />}
      headerStyle={StyleSheet.flatten([{ marginTop: 30 }, props.headerStyle])}
      grabberOptions={{
        color: primaryColor,
        adaptive: false,
        ...props.grabberOptions,
      }}
    />
  );
}

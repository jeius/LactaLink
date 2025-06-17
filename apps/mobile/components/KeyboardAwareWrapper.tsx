import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';

type Props = {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const KeyboardAwareWrapper: React.FC<Props> = ({
  children,
  keyboardVerticalOffset,
  containerStyle,
  contentContainerStyle,
}) => {
  return (
    <>
      <KeyboardAwareScrollView
        style={[{ flex: 1 }, containerStyle]}
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        bottomOffset={Platform.select({
          ios: keyboardVerticalOffset || 64,
          android: keyboardVerticalOffset || 0,
        })}
      >
        {children}
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default KeyboardAwareWrapper;

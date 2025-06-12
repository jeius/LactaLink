import React, { RefObject } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollViewProps,
  StyleProp,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

type Props = {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  scrollViewProps?: ScrollViewProps;
  containerStyle?: StyleProp<ViewStyle>;
  scrollViewRef?: RefObject<ScrollView>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const KeyboardAvoidingWrapper: React.FC<Props> = ({
  children,
  keyboardVerticalOffset = 0,
  scrollViewProps,
  containerStyle,
  scrollViewRef,
  contentContainerStyle,
}) => {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingWrapper;

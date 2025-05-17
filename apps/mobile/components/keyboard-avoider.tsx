import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  scrollViewProps?: ScrollViewProps;
  containerStyle?: StyleProp<ViewStyle>;
};

const KeyboardAvoidingWrapper: React.FC<Props> = ({
  children,
  keyboardVerticalOffset = 0,
  scrollViewProps,
  containerStyle,
}) => {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
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

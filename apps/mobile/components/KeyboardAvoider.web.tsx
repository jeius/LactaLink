import { createContext, useContext } from 'react';
import { TextInput } from 'react-native';
import { Box } from './ui/box';
import ScrollView, { ScrollViewProps } from './ui/ScrollView';
import { VStack, VStackProps } from './ui/vstack';

interface KeyboardAvoiderContextType {
  onFocus?: (id: string) => void;
  registerInput?: (id: string, ref: TextInput | null) => () => void;
}

interface KeyboardAvoiderProps extends ScrollViewProps {
  keyboardVerticalOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const KeyboardAvoiderContext = createContext<KeyboardAvoiderContextType>({});

export default function KeyboardAvoidingScrollView({
  children,
  keyboardVerticalOffset: _keyboardVerticalOffset,
  ...props
}: KeyboardAvoiderProps) {
  return (
    <KeyboardAvoiderContext.Provider value={{}}>
      <ScrollView {...props}>{children}</ScrollView>
    </KeyboardAvoiderContext.Provider>
  );
}

export const KeyboardAvoider: React.FC<
  Pick<KeyboardAvoiderProps, 'keyboardVerticalOffset'> & VStackProps
> = ({ children, keyboardVerticalOffset: _keyboardVerticalOffset, ...props }) => (
  <VStack {...props}><Box>{children}</Box></VStack>
);

export const useKeyboardAvoider = () => useContext(KeyboardAvoiderContext);

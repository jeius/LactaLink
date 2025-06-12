import { Text } from 'react-native';
import { Toaster as Sonner } from 'sonner-native';
import { useTheme } from './AppProvider/ThemeProvider';
import { Spinner } from './ui/spinner';

import '../global.css';

export const Toaster: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Sonner
      position="top-center"
      // offset={100}
      duration={3000}
      swipeToDismissDirection="left"
      visibleToasts={4}
      richColors
      closeButton
      autoWiggleOnUpdate="toast-change"
      pauseWhenPageIsHidden
      theme={theme}
      icons={{
        error: <Text>💥</Text>,
        loading: <Spinner className="text-info-500" size={'small'} />,
        success: <Text>🎉</Text>,
      }}
      toastOptions={{
        actionButtonStyle: {
          paddingHorizontal: 20,
        },
        titleStyle: {
          fontFamily: 'Jakarta-Medium',
        },
        descriptionStyle: {
          fontFamily: 'Jakarta-Regular',
        },
      }}
    />
  );
};

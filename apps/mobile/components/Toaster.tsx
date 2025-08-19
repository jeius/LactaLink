import { Toaster as Sonner } from 'sonner-native';
import { useTheme } from './AppProvider/ThemeProvider';
import { Spinner } from './ui/spinner';

import { BanIcon } from 'lucide-react-native';
import '../global.css';
import { Icon } from './ui/icon';

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
        error: <Icon as={BanIcon} className="text-red-600" />,
        loading: <Spinner className="text-info-500" size={'small'} />,
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

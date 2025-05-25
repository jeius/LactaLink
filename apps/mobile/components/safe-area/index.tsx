import { tva } from '@gluestack-ui/nativewind-utils/tva';

import { FC } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

const style = tva({
  base: 'bg-background-50 justifiy-center relative flex-1 flex-col items-stretch',
});

export type SafeAreaProps = SafeAreaViewProps;

const SafeArea: FC<SafeAreaProps> = ({ className, ...props }) => {
  return <SafeAreaView className={style({ class: className })} {...props} />;
};

export default SafeArea;

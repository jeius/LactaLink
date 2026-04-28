import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { DrawerActions } from '@react-navigation/native';
import { Href, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { FC, useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '../ui/button';

const styles = tva({
  base: 'h-14 justify-start rounded-2xl',
});

interface DrawerItemProps extends ButtonProps {
  /**
   * The `href` to use for the anchor tag on web
   */
  href?: Href;
  /**
   * The label text of the item.
   */
  label: string;
  /**
   * Icon to display for the `DrawerItem`.
   */
  icon?: LucideIcon | FC<SvgProps>;
  /**
   * Whether to highlight the drawer item as active.
   */
  focused?: boolean;
}

export default function DrawerItem({
  href,
  label,
  icon,
  focused,
  variant = 'ghost',
  action = 'default',
  disablePressAnimation = true,
  onPress,
  ...props
}: DrawerItemProps) {
  const router = useRouter();

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      onPress?.(e);
      if (e.defaultPrevented) return;
      DrawerActions.closeDrawer();
      if (href) router.push(href);
    },
    [href, onPress, router]
  );

  return (
    <Button
      {...props}
      variant={focused ? 'solid' : variant}
      action={focused ? 'primary' : action}
      disablePressAnimation={disablePressAnimation}
      onPress={handlePress}
      className={styles({ className: props.className })}
    >
      {icon && <ButtonIcon as={icon} />}
      <ButtonText className="font-JakartaSemiBold">{label}</ButtonText>
    </Button>
  );
}

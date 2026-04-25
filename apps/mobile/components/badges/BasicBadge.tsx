import { LucideIcon, LucideProps } from 'lucide-react-native';
import { FC } from 'react';
import { Badge, BadgeIcon, BadgeText, type BadgeProps } from '../ui/badge';

export interface BasicBadgeProps extends BadgeProps {
  text: string;
  icon?: LucideIcon | FC<LucideProps>;
  iconOnly?: boolean;
  bold?: boolean;
}

export function BasicBadge({
  icon,
  text,
  iconOnly = false,
  bold = false,
  ...props
}: BasicBadgeProps) {
  return (
    <Badge {...props}>
      {!iconOnly && <BadgeText bold={bold}>{text}</BadgeText>}
      {icon && <BadgeIcon as={icon} />}
    </Badge>
  );
}

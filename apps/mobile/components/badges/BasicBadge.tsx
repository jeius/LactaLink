import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC } from 'react';
import { Badge, BadgeIcon, BadgeText } from '../ui/badge';

interface BasicBadgeProps extends ComponentProps<typeof Badge> {
  text: string;
  icon?: LucideIcon | FC<LucideProps>;
  iconOnly?: boolean;
}

export function BasicBadge({ icon, text, iconOnly = false, ...props }: BasicBadgeProps) {
  return (
    <Badge {...props}>
      {!iconOnly && <BadgeText>{text}</BadgeText>}
      {icon && <BadgeIcon as={icon} />}
    </Badge>
  );
}

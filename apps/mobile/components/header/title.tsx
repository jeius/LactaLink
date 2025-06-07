import React from 'react';

import { Text } from '../ui/text';

interface TabsHeaderProps {
  title?: string;
}

export function HeaderTitle({ title: name }: TabsHeaderProps) {
  return (
    <Text size="xl" className="font-JakartaSemiBold">
      {name}
    </Text>
  );
}

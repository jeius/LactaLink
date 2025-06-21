import { MagnetometerOptions, useMagnetometer } from '@/hooks/location/useMagnetometer';
import { ArrowUpIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Box } from './ui/box';
import { Icon } from './ui/icon';

interface CompassProps {
  heading?: number;
  sensorOptions?: MagnetometerOptions;
}

export function Compass({
  sensorOptions: { updateInterval = 'fast' } = {},
  heading: headingProp,
}: CompassProps) {
  const { heading: defaultHeading } = useMagnetometer({ updateInterval });

  const heading = headingProp !== undefined ? headingProp : defaultHeading;

  const [currentHeading, setCurrentHeading] = useState(heading);

  useEffect(() => {
    setCurrentHeading(heading); // Update heading directly
  }, [heading]);

  const rotationStyle = {
    transform: [{ rotate: `${-currentHeading}deg` }],
  };

  return (
    <Box style={[rotationStyle]}>
      <Icon as={ArrowUpIcon} size="xl" />
    </Box>
  );
}

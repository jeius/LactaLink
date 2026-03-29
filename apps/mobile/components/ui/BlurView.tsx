import { BlurViewProps, BlurView as ExpoBlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import React from 'react';

function BlurView({ experimentalBlurMethod = 'dimezisBlurView', ...props }: BlurViewProps) {
  return <ExpoBlurView {...props} experimentalBlurMethod={experimentalBlurMethod} />;
}

cssInterop(BlurView, { className: 'style' });

export default BlurView;

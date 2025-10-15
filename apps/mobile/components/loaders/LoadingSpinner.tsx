import { getLottieAsset } from '@/lib/stores';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import SafeArea, { SafeAreaProps } from '../SafeArea';

interface LoadingSpinnerProps extends SafeAreaProps {
  isLoading?: boolean;
}

export default function LoadingSpinner({ isLoading = true, ...props }: LoadingSpinnerProps) {
  const ref = useRef<LottieView>(null);
  const direction = useRef(1);
  const [frames, setFrames] = useState<[number, number]>([0, 43]);

  useEffect(() => {
    ref.current?.play(frames[0], frames[1]);
  }, [frames]);

  if (!isLoading) {
    return null;
  }

  return (
    <SafeArea {...props} className={props.className || 'bg-primary-50'}>
      <LottieView
        ref={ref}
        autoPlay={false}
        loop={false}
        source={getLottieAsset('babyLoader')}
        style={{ width: '80%', aspectRatio: 1 }}
        onAnimationFinish={() => {
          const newDirection = direction.current * -1;
          direction.current = newDirection;
          if (newDirection > 0) {
            setFrames([33, 43]);
          } else {
            setFrames([43, 33]);
          }
        }}
      />
    </SafeArea>
  );
}

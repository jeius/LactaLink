import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import SafeArea from '../SafeArea';

export default function LoadingSpinner({ isLoading = true }: { isLoading?: boolean }) {
  const ref = useRef<LottieView>(null);
  const direction = useRef(1);
  const [frames, setFrames] = useState<[number, number]>([0, 62]);

  useEffect(() => {
    ref.current?.play(frames[0], frames[1]);
  }, [frames]);

  if (!isLoading) {
    return null;
  }

  return (
    <SafeArea className="bg-primary-50 items-center justify-center">
      <LottieView
        ref={ref}
        autoPlay={false}
        loop={false}
        source={require('@/assets/lottie/loader.json')}
        style={{ width: '80%', aspectRatio: 1 }}
        onAnimationFinish={() => {
          const newDirection = direction.current * -1;
          direction.current = newDirection;
          if (newDirection > 0) {
            setFrames([8, 62]);
          } else {
            setFrames([62, 8]);
          }
        }}
      />
    </SafeArea>
  );
}

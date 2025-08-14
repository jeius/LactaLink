import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function BasicLocationPin({
  strokeWidth = 0,
  fill = '#fe828c',
  ...props
}: SvgProps) {
  const color = fill || props.color || 'currentColor';
  return (
    <Svg
      id="basic-location-pin"
      viewBox="0 0 43.33 58.75"
      width={props.width || 64}
      height={props.height || 64}
      {...props}
    >
      <Path
        fill={color}
        strokeWidth={strokeWidth}
        d="M36.56,6.17C32.44,2.06,27.06,0,21.67,0S10.89,2.06,6.77,6.17C-1.45,14.4-2.53,26.01,5.45,37.8c4.05,5.99,16.22,20.95,16.22,20.95,0,0,12.17-14.96,16.22-20.95,7.98-11.79,6.9-23.4-1.33-31.63ZM21.67,31.78c-5.59,0-10.11-4.53-10.11-10.11s4.52-10.11,10.11-10.11,10.1,4.53,10.1,10.11-4.52,10.11-10.1,10.11Z"
      />
    </Svg>
  );
}

import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function BasicLocationPin({
  strokeWidth = 0,
  fill = '#fe828c',
  ...props
}: SvgProps) {
  return (
    <Svg id="basic-location-pin" viewBox="0 0 64 64" {...props}>
      <Path
        fill={fill}
        strokeWidth={strokeWidth}
        d="M39.64,6.69C35.17,2.23,29.34,0,23.49,0S11.8,2.23,7.34,6.69C-1.58,15.61-2.74,28.2,5.9,40.98c4.39,6.49,17.59,22.71,17.59,22.71,0,0,13.19-16.22,17.58-22.71,8.65-12.78,7.48-25.37-1.44-34.29ZM23.49,34.45c-6.06,0-10.96-4.91-10.96-10.96s4.9-10.96,10.96-10.96,10.95,4.91,10.95,10.96-4.9,10.96-10.95,10.96Z"
      />
    </Svg>
  );
}

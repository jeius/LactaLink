import * as React from 'react';
import Svg, { G, Path, Rect, SvgProps } from 'react-native-svg';

const LocationPin = ({ strokeWidth = 0, fill = '#fe828c', ...props }: SvgProps) => (
  <Svg id="location-pin" viewBox="0 0 64 64" {...props}>
    <G id="location-pin-group">
      <Rect id="background" fill={'none'} strokeWidth={0} stroke={'none'} width="64" height="64" />
      <Path
        id="pin"
        fill={fill}
        strokeWidth={strokeWidth}
        d="M32,.58C20.4.58,10.99,9.98,10.99,21.58c0,18.09,14.31,31.77,19.31,36.01.98.83,2.41.83,3.39,0,5-4.24,19.31-17.92,19.31-36.01C53,9.98,43.6.58,32,.58ZM32,35.05c-7.44,0-13.47-6.03-13.47-13.47s6.03-13.46,13.47-13.46,13.46,6.03,13.46,13.46-6.03,13.47-13.46,13.47Z"
      />
      <Path
        id="shadow"
        fill={fill}
        strokeWidth={strokeWidth}
        d="M45.58,58.72c0,2.65-6.08,4.79-13.58,4.79s-13.58-2.15-13.58-4.79c0-1.76,2.69-3.3,6.69-4.13,1.71,1.74,3.23,3.1,4.32,4.02.72.61,1.63.94,2.57.94s1.85-.33,2.57-.94c1.09-.92,2.6-2.28,4.32-4.02,4,.83,6.69,2.37,6.69,4.13Z"
      />
    </G>
  </Svg>
);

export default LocationPin;

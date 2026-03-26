import { randomUUID } from 'expo-crypto';
import React, { FC } from 'react';
import {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Svg,
  SvgProps,
} from 'react-native-svg';

const HandBottleIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;
  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      fill="none"
      stroke={rest.stroke || color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path id="frame" stroke="none" d="M0 0h24v24H0z" />
      <Path d="M10.37 9.81h2.03c.52 0 1.03-.12 1.5-.35h0c.46-.23.98-.35 1.5-.35h2.03" />
      <Path d="M10.37 11.93V8.38c0-1.55 1.26-2.8 2.8-2.8h1.46c1.55 0 2.8 1.25 2.8 2.8V11" />
      <Path d="M10.37 5.58h7.06c-.88.29-1.77-.05-2.12-.71-.34-.63-.04-1.31 0-1.41 0-.77-.64-1.41-1.41-1.41s-1.41.64-1.41 1.41c.04.1.34.78 0 1.41-.35.66-1.24.99-2.12.71" />
      <Path d="M10.79 15.72h1.85c1.02 0 1.85-.83 1.85-1.85s-.83-1.85-1.85-1.85H9.86c-.56 0-1.02.19-1.3.56l-5.19 5" />
      <Path d="m7.08 21.28 1.48-1.3c.28-.37.74-.56 1.3-.56h3.7c1.02 0 1.94-.37 2.59-1.11l4.26-4.07c.74-.7.78-1.88.07-2.62s-1.88-.78-2.62-.07l-3.89 3.61M2.45 16.65l5.56 5.56" />
    </Svg>
  );
};

HandBottleIcon.displayName = 'HandBottleIcon';
export { HandBottleIcon };

const MilkBottleIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;
  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      fill="none"
      stroke={rest.stroke || color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M14.2 7A2.795 2.795 0 0 1 17 9.8V20a2 2 0 0 1-2 2H8.99a2 2 0 0 1-2-2V9.8A2.795 2.795 0 0 1 9.79 7" />
      <Path d="M17 7c-1.24.4-2.5-.07-3-1-.48-.89-.06-1.86 0-2a2 2 0 0 0-4 0c.06.14.48 1.11 0 2-.5.93-1.76 1.4-3 1z" />
      <Path d="M7 13h2.88a4.7 4.7 0 0 0 2.12-.5 4.7 4.7 0 0 1 2.12-.5H17" />
      <Path d="M7 16h4" />
      <Path d="M7 19h5" />
    </Svg>
  );
};

const MilkBottlePlus2Icon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;
  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      fill="none"
      stroke={rest.stroke || color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M14.19 7a2.795 2.795 0 0 1 2.8 2.8" />
      <Path d="M17 20a2 2 0 0 1-2 2H8.99a2 2 0 0 1-2-2V9.8A2.795 2.795 0 0 1 9.79 7" />
      <Path d="M17 7c-1.24.4-2.5-.07-3-1-.48-.89-.06-1.86 0-2a2 2 0 0 0-4 0c.06.14.48 1.11 0 2-.5.93-1.76 1.4-3 1Z" />
      <Path d="M17.06 15.03H21" />
      <Path d="M19.03 13.06V17" />
      <Path d="M7 13h2.88a4.7 4.7 0 0 0 2.12-.5 4.7 4.7 0 0 1 2.12-.5H15" />
      <Path d="M7 16h4" />
      <Path d="M7 19h5" />
    </Svg>
  );
};

MilkBottleIcon.displayName = 'MilkBottleIcon';
MilkBottlePlus2Icon.displayName = 'MilkBottlePlus2Icon';
export { MilkBottleIcon, MilkBottlePlus2Icon };

const UserLocationIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 1, ...rest } = props;

  const gradientId = `gradient-${randomUUID()}`;

  return (
    <Svg {...rest} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="306"
          x2="306"
          y1="-350"
          y2="-339"
          gradientTransform="matrix(1 0 0 -1 -294 -338)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={rest.fill || color} stopOpacity=".6" />
          <Stop offset="0" stopColor={rest.fill || color} stopOpacity=".85" />
          <Stop offset="1" stopColor={rest.fill || color} stopOpacity=".25" />
        </LinearGradient>
      </Defs>
      <Path
        d="M15.15 10.84c1.53-2.19 3.06-4.38 4.58-6.57C19.25 3.77 16.46 1 12 1S4.75 3.77 4.27 4.27c1.53 2.19 3.06 4.38 4.58 6.57.29.25 1.43 1.16 3.15 1.16s2.86-.91 3.15-1.16"
        strokeWidth={0}
        fill={`url(#${gradientId})`}
      />
      <Circle
        cx="12"
        cy="12"
        r="3.36"
        fill={rest.fill || color}
        stroke={rest.stroke || color}
        strokeWidth={strokeWidth}
        stroke-miterlimit="10"
      />
    </Svg>
  );
};

UserLocationIcon.displayName = 'UserLocationIcon';
export { UserLocationIcon };

const BasicLocationPin: FC<SvgProps> = ({ strokeWidth = 0, color = 'currentColor', ...props }) => {
  return (
    <Svg
      {...props}
      viewBox="0 0 43.33 58.75"
      strokeWidth={strokeWidth}
      fill={props.fill || color}
      stroke={props.stroke || color}
    >
      <Path d="M36.56,6.17C32.44,2.06,27.06,0,21.67,0S10.89,2.06,6.77,6.17C-1.45,14.4-2.53,26.01,5.45,37.8c4.05,5.99,16.22,20.95,16.22,20.95,0,0,12.17-14.96,16.22-20.95,7.98-11.79,6.9-23.4-1.33-31.63ZM21.67,31.78c-5.59,0-10.11-4.53-10.11-10.11s4.52-10.11,10.11-10.11,10.1,4.53,10.1,10.11-4.52,10.11-10.1,10.11Z" />
    </Svg>
  );
};

BasicLocationPin.displayName = 'BasicLocationPin';
export { BasicLocationPin };

const FaceOutlineIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;
  return (
    <Svg
      {...rest}
      viewBox="0 0 63 63"
      strokeWidth={strokeWidth}
      fill="none"
      stroke={props.stroke || color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path id="frame" stroke="none" fill="none" d="M0 0h63.72v63.72H0z" />
      <Path d="M20.31,62.09v-11.19c-.85-.93-1.86-2.22-2.76-3.9-1.07-2-1.61-3.85-1.89-5.22-.16.03-.86.13-1.51-.33-.91-.64-.86-1.77-.85-1.84-.34-1.67-.68-3.34-1.02-5.01-.26-.54-.63-1.47-.68-2.66-.04-.97.08-3.14,1.07-3.41.15-.04.65-.13,1.49.66-.44-1.47-.82-3.31-.91-5.45-.2-4.73,1.17-8.47,2.15-10.6.75-1.45,2.05-3.56,4.21-5.61.99-.93,2.77-2.6,5.64-3.8.62-.26,3.39-1.39,7.22-1.38,2.88,0,5.21.66,6.74,1.22,1.61.64,4.35,1.99,6.83,4.7,1.63,1.78,2.62,3.58,3.22,4.9,1.18,2.44,2.84,6.88,2.17,12.28-.17,1.38-.47,2.63-.82,3.73.8-.71,1.25-.68,1.47-.61,1.27.44.76,4.59.72,4.93-.42,1.86-.83,3.72-1.25,5.58,0,.21-.05,1.14-.79,1.9-.58.59-1.26.74-1.51.79-.32,1.3-.85,2.94-1.77,4.72-1,1.94-2.14,3.42-3.08,4.46,0,3.48-.05,7.65-.05,11.13" />
    </Svg>
  );
};

FaceOutlineIcon.displayName = 'FaceOutlineIcon';
export { FaceOutlineIcon };

const UserUserIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;

  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      fill="none"
      stroke={props.stroke || color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M19,9c.02-.38.04-1.84-1-3-1.16-1.29-3.15-1.71-5-1l2-3-2,3" />
      <Path d="M22,22c0-2.07-1.68-3.75-3.75-3.75s-3.75,1.68-3.75,3.75" />
      <Path d="M4.64,15c-.02.38-.04,1.84,1,3,1.16,1.29,3.15,1.71,5,1l-2,3,2-3" />
      <Path d="M9.52,10.44c0-2.07-1.68-3.75-3.75-3.75s-3.75,1.68-3.75,3.75" />
      <Circle cx="18.25" cy="15.91" r="2.34" fill="none" />
      <Circle cx="5.77" cy="4.34" r="2.34" fill="none" />
      <Line x1="10.64" y1="19" x2="8.64" y2="17" />
      <Line x1="13" y1="5" x2="15" y2="7" />
      <Rect id="frame" fill="none" stroke="none" />
    </Svg>
  );
};

UserUserIcon.displayName = 'UserUserIcon';
export { UserUserIcon };

const UserBuildingIcon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;

  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      fill="none"
      stroke={props.stroke || color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M19,9c.02-.38.04-1.84-1-3-1.16-1.29-3.15-1.71-5-1l2-3-2,3" />
      <Path d="M22,22c0-2.07-1.68-3.75-3.75-3.75s-3.75,1.68-3.75,3.75" />
      <Path d="M4.64,15c-.02.38-.04,1.84,1,3,1.16,1.29,3.15,1.71,5,1l-2,3,2-3" />
      <Path d="M7,11V3c0-.55-.37-1-.83-1h-3.33c-.46,0-.83.45-.83,1v8" />
      <Path d="M7,6.5h2.2c.44,0,.8.4.8.9v2.7c0,.5-.36.9-.8.9H2v-2" />
      <Circle cx="18.25" cy="15.91" r="2.34" fill="none" />
      <Line x1="10.64" y1="19" x2="8.64" y2="17" />
      <Line x1="13" y1="5" x2="15" y2="7" />
      <Rect id="frame" fill="none" stroke="none" />
    </Svg>
  );
};

UserBuildingIcon.displayName = 'UserBuildingIcon';
export { UserBuildingIcon };

const HandBottle2Icon: FC<SvgProps> = (props) => {
  const { color = 'currentColor', strokeWidth = 2, ...rest } = props;
  return (
    <Svg
      {...rest}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      fill="none"
      stroke={props.stroke || color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <G id="Layer_1_00000013878712297255039800000000841960250553796754_">
        <G id="Layer_1_00000124131493553583600510000004459382438053388709_">
          <Path
            d="M15.9,16.9l2.7-2.3c0.8-0.8,2.1-0.8,2.9,0.1c0.8,0.8,0.8,2.1-0.1,2.9l-3.6,3.3C17.1,21.6,16.1,22,15,22h-4
			c-1.1,0-2.1-0.4-2.8-1.2l-1.3-1.5C6.7,19.1,6.4,19,6.2,19H5"
          />
          <Path d="M2,14h12c1.1,0,2,0.9,2,2s-0.9,2-2,2h-2" />
          <Path d="M5,14v6c0,0.6-0.4,1-1,1H2" />
        </G>
        <G id="Layer_3">
          <Path d="M8.6,7.5h8.1" />
          <Path d="M17.8,14.8v-2.1c0-0.5-0.2-1-0.7-1.4l-0.7-0.6c-0.4-0.4-0.7-0.9-0.7-1.4V7.5" />
          <Path d="M9.7,7.5v1.7c0,0.5-0.2,1-0.7,1.4l-0.7,0.6c-0.4,0.4-0.7,0.9-0.7,1.4v0.7" />
        </G>
      </G>
      <G id="Layer_3_00000173873728618600904060000010498903134663808149_">
        <Path
          d="M11,7.1c0.1-0.2,0.1-0.6,0.1-0.9c0-0.4-0.1-0.7-0.1-0.9C11,5.1,11,5,11,5V4.9l-0.1-0.3c-0.2-0.6,0-1.3,0.5-1.7
		l0.2-0.2c0.6-0.5,1.5-0.5,2.1,0l0,0c0.4,0.4,0.6,1,0.5,1.5l-0.1,0.4c0,0.1,0,0.3,0,0.4C14,5.3,14,5.6,14,6.1c0,0.4,0.1,0.7,0.1,1"
        />
      </G>
      <G id="Layer_2">
        <Path d="M11,7.5l-0.7-2.7c0-0.7,0.2-1.4,0.7-1.9l0,0c0.9-1,2.4-1,3.3,0l0,0C14.7,3.4,15,4,15,4.7l-0.4,2.8" />
      </G>
    </Svg>
  );
};

HandBottle2Icon.displayName = 'HandBottle';
export { HandBottle2Icon };

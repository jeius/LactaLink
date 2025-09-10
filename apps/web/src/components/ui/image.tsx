import NextImage from 'next/image';
import React from 'react';

type ImageProps = React.ComponentPropsWithoutRef<typeof NextImage>;

export default function Image(props: ImageProps) {
  return <NextImage {...props} />;
}

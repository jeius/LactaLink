import canUseDOM from '@/lib/utils/canUseDOM';
import { getClientSideURL, getServerSideURL } from '@/lib/utils/getURL';
import NextImage from 'next/image';
import React from 'react';

type ImageProps = React.ComponentPropsWithoutRef<typeof NextImage>;

// Define the loader function outside the component
function reRouteToProxy(src: string) {
  const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL();
  const proxyUrl = new URL('/api/image-proxy', baseUrl);
  proxyUrl.searchParams.set('url', src);
  return proxyUrl.toString();
}

export default function Image(props: ImageProps) {
  const { src } = props;

  let newSrc = src;

  if (typeof newSrc === 'string') {
    newSrc = reRouteToProxy(newSrc);
  } else {
    // @ts-expect-error - ts could not infer the type correctly
    newSrc.src = reRouteToProxy(newSrc.src);
  }
  return <NextImage {...props} src={newSrc} />;
}

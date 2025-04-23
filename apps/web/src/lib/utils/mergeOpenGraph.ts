import type { Metadata } from 'next';
import { getServerSideURL } from './getURL';

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'A comprehensive Thesis Management System web app for students and faculty, enabling streamlined thesis proposal submission, progress tracking, document management, and collaboration.',
  images: [
    {
      url: `${getServerSideURL()}/og-image.jpg`,
    },
    {
      url: `${getServerSideURL()}/profile-cover.jpg`,
    },
  ],
  siteName: 'Thesis Management System',
  title: 'Thesis Management System: Streamline Your Academic Journey',
  url: getServerSideURL(),
};

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  };
};

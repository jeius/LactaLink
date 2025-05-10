import { MetaConfig } from 'payload';
import { getServerSideURL } from './getURL';
import { mergeOpenGraph } from './mergeOpenGraph';

const title = 'Admin - Dashboard';
const description = 'A dashboard panel for admin users of LactaLink.';

export const baseAdminMeta: MetaConfig = {
  title,
  description,
  titleSuffix: '| LactaLink',
  creator: 'Julius Pahama <www.linkedin.com/in/julius-pahama>',
  applicationName: 'LactaLink',
  icons: [`${getServerSideURL()}/favicon.ico`],
  openGraph: mergeOpenGraph(),
  twitter: {
    title,
    description,
    site: 'www.lactalink.com',
    card: 'summary_large_image',
    images: `${getServerSideURL()}/og-image.png`,
  },
};

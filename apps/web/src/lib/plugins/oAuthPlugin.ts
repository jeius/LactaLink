import { adminAuthPlugin } from 'payload-auth-plugin';
import { GoogleAuthProvider } from 'payload-auth-plugin/providers';

export const oAuthPlugin: unknown[] = [
  adminAuthPlugin({
    accountsCollectionSlug: 'accounts',
    allowSignUp: true,
    providers: [
      GoogleAuthProvider({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      }),
    ],
  }),
  // appAuthPlugin({
  //   name: 'LactaLink',
  //   accountsCollectionSlug: 'accounts',
  //   usersCollectionSlug: 'users',
  //   allowAutoSignUp: true,
  //   secret: process.env.PAYLOAD_SECRET || 'nviewnsal;p2id1982bsfa982A2E4S',
  //   authenticationStrategy: 'Cookie',
  //   providers: [
  //     GoogleAuthProvider({
  //       client_id: process.env.GOOGLE_CLIENT_ID || '',
  //       client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
  //     }),
  //   ],
  // }),
];

import { User } from '@/lib/types';
import { getRequestCollection, verifyGoogleToken } from '@/lib/utils';
import { status as httpStatus } from 'http-status';
import type { PayloadHandler } from 'payload';
import { APIError, generatePayloadCookie, headersWithCors } from 'payload';
import { loginOperation } from '../operations/login';

export const googleLoginHandler: PayloadHandler = async (req) => {
  const payload = req.payload;
  const collection = getRequestCollection(req);

  try {
    const googleToken = req.headers.get('authorization')?.split(' ')[1];

    if (!googleToken) {
      throw new APIError('Missing Google token.', httpStatus.NOT_FOUND);
    }

    const googleUser = await verifyGoogleToken(googleToken);

    if (!googleUser) {
      throw new APIError('Invalid Google token.', httpStatus.NOT_ACCEPTABLE);
    }

    const { email, given_name, family_name, sub: googleId, exp, picture } = googleUser;
    if (!email || !given_name || !family_name || !googleId) {
      throw new APIError('Invalid user data from Google', httpStatus.NOT_ACCEPTABLE);
    }

    payload.logger.info(`Finding existing user with email: ${email}`);

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      overrideAccess: true,
      req,
      depth: 1,
      limit: 1,
      showHiddenFields: true,
      pagination: false,
      where: { email: { equals: email } },
    });

    let user: User;

    if (existingUsers.totalDocs > 0) {
      user = existingUsers.docs[0];
      payload.logger.info(`User found.`);
    } else {
      payload.logger.info(`User with email: ${email} was not found. Creating new user.`);
      // Create new user
      user = await payload.create({
        collection: 'users',
        depth: 0,
        overrideAccess: true,
        disableVerificationEmail: true,
        showHiddenFields: true,
        req,
        data: {
          email,
          password: googleId, // Use Google ID as password
          type: 'individual',
          createdVia: 'oauth',
        },
      });

      payload.logger.info(`User created with email: ${user.email}`);
    }

    payload.logger.info(`Checking if account already exists for user: ${user.email}`);

    // Check if account already exists
    const existingAccounts = await payload.find({
      collection: 'accounts',
      overrideAccess: true,
      req,
      depth: 1,
      limit: 1,
      pagination: false,
      where: {
        and: [
          {
            providerID: { equals: googleId },
          },
          {
            provider: { equals: 'google' },
          },
          {
            type: { equals: 'oauth' },
          },
        ],
      },
    });

    // If account doesn't exist, create it
    // This is the account that links the user to the provider
    if (existingAccounts.totalDocs === 0) {
      payload.logger.info('Account not found. Creating new account.');

      // Create new account
      const account = await payload.create({
        collection: 'accounts',
        req,
        depth: 1,
        data: {
          provider: 'google',
          providerID: googleId,
          type: 'oauth',
          user: user.id,
          givenName: given_name,
          familyName: family_name,
          expiration: exp,
          picture,
        },
      });

      payload.logger.info(`Account created with id: ${account.id}`);
    }

    req.user = { ...user, collection: 'users' };

    const result = await loginOperation(req);

    if ('token' in result) {
      const cookie = generatePayloadCookie({
        collectionAuthConfig: collection.config.auth,
        cookiePrefix: req.payload.config.cookiePrefix,
        token: result.token,
      });

      return Response.json(
        {
          message: 'Authentication Passed!',
          ...result,
        },
        {
          headers: headersWithCors({
            headers: new Headers({
              'Set-Cookie': cookie,
            }),
            req,
          }),
          status: httpStatus.OK,
        }
      );
    }

    return Response.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof APIError) {
      return Response.json(
        {
          message: err.message,
        },
        { status: err.status }
      );
    }

    // Handle other errors (e.g., database errors, network errors)
    return Response.json(
      {
        message: 'Authentication failed',
        error: err,
      },
      { status: 500 }
    );
  }
};

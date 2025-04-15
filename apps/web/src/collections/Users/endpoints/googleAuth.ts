import { verifyGoogleToken } from '@/lib/utils/verifyGoogleToken';
import { User } from '@/payload-types';
import { APIError, Endpoint, PayloadHandler } from 'payload';

const handler: PayloadHandler = async (req) => {
  const payload = req.payload;

  try {
    const googleToken = req.headers.get('authorization')?.split(' ')[1];

    if (!googleToken) {
      throw new APIError('Missing Google token.', 400);
    }

    const googleUser = await verifyGoogleToken(googleToken);

    if (!googleUser) {
      throw new APIError('Invalid Google token.', 401);
    }

    const { email, given_name, family_name, sub: googleId, exp, picture } = googleUser;
    if (!email || !given_name || !family_name || !googleId) {
      throw new APIError('Invalid user data from Google', 400);
    }

    const existingUsers = await payload.find({
      collection: 'users',
      overrideAccess: true,
      req,
      depth: 1,
      limit: 1,
      pagination: false,
      where: { email: { equals: email } },
    });

    let user: User;

    if (existingUsers.totalDocs > 0) {
      user = existingUsers.docs[0];
    } else {
      // Create new user
      user = await payload.create({
        collection: 'users',
        depth: 0,
        overrideAccess: true,
        disableVerificationEmail: true,
        req,
        data: {
          email,
          password: googleId, // Use Google ID as password
        },
      });
    }

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
            providerAccountId: { equals: googleId },
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
      await payload.create({
        collection: 'accounts',
        req,
        depth: 1,
        data: {
          provider: 'google',
          providerAccountId: googleId,
          type: 'oauth',
          user: user.id,
          givenName: given_name,
          familyName: family_name,
          expiration: exp,
          picture,
        },
      });
    }

    const password = user.password;
    if (!password) {
      throw new APIError('User does not have a password', 400);
    }

    // Log in the user - create a JWT
    const {
      user: loggedInUser,
      exp: tokenExp,
      token,
    } = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
        password,
      },
      overrideAccess: true,
    });

    return Response.json({ user: loggedInUser, token, exp: tokenExp });
  } catch (err) {
    payload.logger.error('Google Auth Error', err);
    if (err instanceof APIError) {
      return Response.json({
        message: err.message,
        status: err.status,
        error: err,
      });
    }

    // Handle other errors (e.g., database errors, network errors)
    return Response.json({
      message: 'Authentication failed',
      status: 500,
      error: err,
    });
  }
};

export const googleAuth: Endpoint = {
  path: '/login-google',
  method: 'post',
  handler,
};

import type { BaseApiFetchArgs, FindMany } from '@lactalink/types/api';
import type { BackendSession } from '@lactalink/types/auth';
import type { ErrorCodes } from '@lactalink/types/errors';
import type { User } from '@lactalink/types/payload-generated-types';
import type { Database } from '@lactalink/types/supabase';
import {
  AuthError,
  type ResendParams,
  type Session,
  type SignInWithIdTokenCredentials,
  type SignInWithOAuthCredentials,
  type SignInWithPasswordCredentials,
  type SignOut,
  type SignUpWithPasswordCredentials,
  type Subscription,
  type SupabaseClient,
  type VerifyOtpParams,
} from '@supabase/supabase-js';
import type { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import status from 'http-status';
import { stringify } from 'qs';
import type { ApiClientConfig, IAuthClient } from '../interfaces';
import { apiFetch } from '../utils/apiFetch';
import { isServerEnvironment } from '../utils/getEnvironment';

type BaseApiFetchArgsWithoutToken = Omit<BaseApiFetchArgs, 'token'>;
type UsersUpdate = Database['public']['Tables']['users']['Update'];
type UserTable = Database['public']['Tables']['users']['Row'];

export class AuthClient implements IAuthClient {
  private baseFetchOptions: () => BaseApiFetchArgsWithoutToken;
  private getSbClient: () => SupabaseClient;
  private isServer: boolean;
  private token: string | null = null;

  public readonly getSbAuth: () => SupabaseAuthClient;

  constructor(
    baseFetchOptions: () => BaseApiFetchArgsWithoutToken,
    getSupabaseClient: () => SupabaseClient,
    environment: ApiClientConfig['environment']
  ) {
    this.baseFetchOptions = baseFetchOptions;
    this.getSbClient = getSupabaseClient;
    this.getSbAuth = () => getSupabaseClient().auth;
    this.isServer = isServerEnvironment(environment);

    this._initializeToken();
  }

  // ✅ Always get fresh Supabase client with current cookies
  private _ensureSbAuthAvailable = (operation: string): SupabaseAuthClient => {
    const client = this.getSbClient(); // Fresh client every time!
    if (!client?.auth) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return client.auth;
  };

  // Ensure Supabase client is available for client-side operations only
  private _ensureClientSideOperation = (operation: string): SupabaseAuthClient => {
    const client = this.getSbClient();
    if (this.isServer && !client) {
      throw new Error(`Supabase client not available for ${operation} on server`);
    }
    if (!client) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return client.auth;
  };

  private _getSbDatabaseClient = () => {
    const client = this.getSbClient();
    if (!client) {
      throw new Error('Supabase client not available for database operations');
    }
    return client;
  };

  // Token management
  private _getCurrentToken = async (): Promise<string | null> => {
    const sb = this._ensureSbAuthAvailable('_getCurrentToken');

    const { data, error } = await sb.getSession();
    if (error) throw error;

    return data.session?.access_token || null;
  };

  private _setToken = (token: string | null): void => {
    this.token = token;
  };

  private _syncToken = async (): Promise<void> => {
    const token = await this._getCurrentToken();
    this._setToken(token);
  };

  private _initializeToken = async (): Promise<void> => {
    try {
      const token = await this._getCurrentToken();
      this._setToken(token);
    } catch (error) {
      // Ignore initialization errors
      console.warn('Failed to initialize token:', error);
    }
  };

  // Fetch options
  private _getFetchOptionsWithToken = async (): Promise<BaseApiFetchArgs> => {
    const baseOptions = this.baseFetchOptions();
    return {
      ...baseOptions,
      token: this.token,
    };
  };

  private _getBackendSession = async (): Promise<BackendSession> => {
    // Ensure we have latest token before making request
    await this._syncToken();

    const fetchOptions = await this._getFetchOptionsWithToken();
    const { url: apiUrl, ...restOfFetchOptions } = fetchOptions;

    const options: Omit<FindMany<'users'>, 'collection'> = {
      depth: 5,
      joins: {
        addresses: { limit: 0, count: true },
        deliveryPreferences: { limit: 0, count: true },
      },
    };

    const searchParams = stringify(options, { addQueryPrefix: true });
    const url = new URL('/api/users/me', apiUrl).toString() + searchParams;

    const res = await apiFetch<BackendSession>({
      ...restOfFetchOptions,
      url,
      method: 'GET',
    });

    if ('error' in res) {
      throw new AuthError(res.message, res.status, 'backend_session_error');
    }

    return res.data;
  };

  // Auth flow helpers
  private _handleAuthSuccess = async (): Promise<User> => {
    try {
      const user = await this.getMeUser();
      if (!user) {
        throw new AuthError(
          'User not authenticated',
          status.UNAUTHORIZED,
          'user_not_authenticated'
        );
      }
      return user;
    } catch (error) {
      // Clear token on error
      this._setToken(null);
      throw error;
    }
  };

  // Check if email is already registered
  private _isEmailRegistered = async (email: string): Promise<boolean> => {
    const sb = this._getSbDatabaseClient();

    const { count, error } = await sb
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);

    if (error) {
      throw new AuthError(error.message, status.INTERNAL_SERVER_ERROR, error.code);
    }

    return (count ?? 0) > 0;
  };

  // Check if phone is already registered
  private _isPhoneRegistered = async (phone: string): Promise<boolean> => {
    const sb = this._getSbDatabaseClient();
    const { count, error } = await sb
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone);

    if (error) {
      throw new AuthError(error.message, status.INTERNAL_SERVER_ERROR, error.code);
    }

    return (count ?? 0) > 0;
  };

  // PUBLIC METHODS (keep at bottom)

  signIn = async (credentials: SignInWithPasswordCredentials): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('signIn');
    const { error } = await sbAuth.signInWithPassword(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  signInWithIdToken = async (credentials: SignInWithIdTokenCredentials): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('signInWithIdToken');
    const { error } = await sbAuth.signInWithIdToken(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  signInWithOAuth = async (credentials: SignInWithOAuthCredentials) => {
    const sbAuth = this._ensureSbAuthAvailable('signInWithOAuth');
    const { error, data } = await sbAuth.signInWithOAuth(credentials);
    if (error) throw error;
    return data;
  };

  signUp = async (credentials: SignUpWithPasswordCredentials) => {
    const sbAuth = this._ensureSbAuthAvailable('signUp');

    const email = 'email' in credentials ? credentials.email : null;
    const isEmailExists = email && (await this._isEmailRegistered(email));
    if (isEmailExists) {
      const code: ErrorCodes = 'email_exists';
      throw new AuthError('Email already taken.', status.CONFLICT, code);
    }

    const phone = 'phone' in credentials ? credentials.phone : null;
    const isPhoneExists = phone && (await this._isPhoneRegistered(phone));
    if (isPhoneExists) {
      const code: ErrorCodes = 'phone_exists';
      throw new AuthError('Phone number already taken.', status.CONFLICT, code);
    }

    const { error, data } = await sbAuth.signUp(credentials);
    if (error) throw error;
    if (!data.user) {
      const code: ErrorCodes = 'unexpected_failure';
      throw new AuthError('Failed to create user', status.INTERNAL_SERVER_ERROR, code);
    }

    const sb = this._getSbDatabaseClient();
    const { data: user } = await sb
      .from('users')
      .select('id, email, phone')
      .eq('auth_id', data.user.id)
      .limit(1)
      .single<UserTable>();

    if (!user) {
      const code: ErrorCodes = 'user_not_found';
      throw new AuthError('User not found after sign up', status.NOT_FOUND, code);
    }

    return { id: user.id, email: user.email, phone: user.phone };
  };

  createAdminUser = async (credentials: SignUpWithPasswordCredentials): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('createAdminUser');
    const sb = this._getSbDatabaseClient();
    const {
      data: { user: sbUser },
      error: signUpError,
    } = await sbAuth.signUp(credentials);
    if (!sbUser || signUpError) {
      const code: ErrorCodes = signUpError?.code || 'admin_creation_failed';
      const message = signUpError?.message || 'Failed to create admin user';
      throw new AuthError(message, status.INTERNAL_SERVER_ERROR, code);
    }

    const { error } = await sb
      .from('users')
      .update<UsersUpdate>({ role: 'ADMIN' })
      .eq('auth_id', sbUser.id);

    if (error) {
      throw new AuthError(error.message, status.INTERNAL_SERVER_ERROR, error.code);
    }
    return await this._handleAuthSuccess();
  };

  signOut = async (options?: SignOut): Promise<void> => {
    const sbAuth = this._ensureSbAuthAvailable('signOut');
    const { error } = await sbAuth.signOut(options);
    if (error) throw error;

    // Clear token after sign out
    this._setToken(null);
  };

  resetPasswordForEmail = async (
    email: string,
    options?: {
      redirectTo?: string;
      captchaToken?: string;
    }
  ): Promise<void> => {
    const sbAuth = this._ensureSbAuthAvailable('resetPassword');
    const { error } = await sbAuth.resetPasswordForEmail(email, options);
    if (error) throw error;
  };

  updateEmail = async (email: string): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('updateEmail');
    const { error } = await sbAuth.updateUser({ email });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  updatePhone = async (phone: string): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('updatePhone');
    const { error } = await sbAuth.updateUser({ phone });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  updatePassword = async (password: string): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('updatePassword');
    const { error } = await sbAuth.updateUser({ password });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  verifyOTP = async (credentials: VerifyOtpParams): Promise<User> => {
    const sbAuth = this._ensureSbAuthAvailable('verifyOTP');
    const { error } = await sbAuth.verifyOtp(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  sendVerification = async (params: ResendParams): Promise<void> => {
    const sbAuth = this._ensureSbAuthAvailable('sendVerification');
    const { error } = await sbAuth.resend(params);
    if (error) throw error;
  };

  getMeUser = async (): Promise<User | null> => {
    const { user } = await this._getBackendSession();
    return user;
  };

  getSession = async () => {
    const sbAuth = this._ensureSbAuthAvailable('getSession');

    const { data, error } = await sbAuth.getSession();
    if (error) throw error;
    if (!data.session) return null;

    const backendSession = await this._getBackendSession();
    const { access_token: token, ...restOfSession } = data.session;

    return { ...restOfSession, ...backendSession, token };
  };

  getToken = async (): Promise<string | null> => {
    await this._syncToken();
    return this.token;
  };

  // Auth state listener
  onAuthStateChange = (
    callback?: (event: string, session: Session | null) => void
  ): Subscription => {
    // Auth state listeners don't work on server - throw error
    const sbAuth = this._ensureClientSideOperation('onAuthStateChange');

    return sbAuth.onAuthStateChange((event, session) => {
      // Do something here if needed
      this._setToken(session?.access_token || null);

      if (callback) {
        callback(event, session);
      }
    }).data.subscription;
  };
}

import type { ApiClientConfig, IAuthClient } from '@/interfaces';
import type { BackendSession } from '@lactalink/types/auth';
import type { ErrorCodes } from '@lactalink/types/errors';
import type { User } from '@lactalink/types/payload-generated-types';
import { SanitizedPermissions } from '@lactalink/types/payload-types';
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
import status from 'http-status';
import { isServerEnvironment } from '../utils/getEnvironment';
import { Config } from './payload-types';
import { PayloadSDK } from './PayloadSDK';

type UsersUpdate = Database['public']['Tables']['users']['Update'];
type UserTable = Database['public']['Tables']['users']['Row'];

type SupabaseAuthClient = SupabaseClient['auth'];

export class AuthClient implements IAuthClient {
  private _isServer: boolean;
  private _token: string | null = null;
  public readonly getSbAuth: () => SupabaseAuthClient;

  constructor(
    private _getSbClient: () => SupabaseClient,
    private _apiClient: PayloadSDK<Config>,
    environment: ApiClientConfig['environment']
  ) {
    this.getSbAuth = () => _getSbClient().auth;
    this._isServer = isServerEnvironment(environment);

    this._initializeToken();
  }

  // ✅ Always get fresh Supabase client with current cookies
  private _ensureSbAuthAvailable = (operation: string): SupabaseAuthClient => {
    const client = this._getSbClient(); // Fresh client every time!
    if (!client?.auth) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return client.auth;
  };

  // Ensure Supabase client is available for client-side operations only
  private _ensureClientSideOperation = (operation: string): SupabaseAuthClient => {
    const client = this._getSbClient();
    if (this._isServer && !client) {
      throw new Error(`Supabase client not available for ${operation} on server`);
    }
    if (!client) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return client.auth;
  };

  private _getSbDatabaseClient = () => {
    const client = this._getSbClient();
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
    this._token = token;
    this._apiClient.setAuthHeaders(token);
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

  private _getBackendSession = async (): Promise<BackendSession> => {
    const { collection: _, ...session } = await this._apiClient.me({ collection: 'users' });
    return {
      ...session,
      user: session.user,
      permissions: {} as SanitizedPermissions, // TODO: update backend to return permissions
      strategy: session.strategy ?? 'Unknown strategy',
    };
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
    } = await sbAuth.signUp(credentials).catch((error) => {
      console.error('Error during admin user sign up:', error);
      throw error;
    });

    if (signUpError) {
      const code: ErrorCodes = signUpError?.code || 'admin_creation_failed';
      const message = signUpError?.message || 'Failed to create admin user';
      throw new AuthError(message, status.INTERNAL_SERVER_ERROR, code);
    }

    if (!sbUser) {
      const code: ErrorCodes = 'admin_creation_failed';
      throw new AuthError('Failed to create admin user', status.INTERNAL_SERVER_ERROR, code);
    }

    const { error } = await sb
      .from('users')
      .update<UsersUpdate>({ role: 'ADMIN' })
      .eq('auth_id', sbUser.id);

    if (error) throw error;

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
    return this._token;
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

import { BackendSession, BaseApiFetchArgs, User } from '@lactalink/types';
import { ApiClientConfig, IAuthClient } from '@lactalink/types/interfaces';
import {
  AuthError,
  OAuthResponse,
  ResendParams,
  Session,
  SignInWithIdTokenCredentials,
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignOut,
  SignUpWithPasswordCredentials,
  Subscription,
  SupabaseClient,
  VerifyOtpParams,
} from '@supabase/supabase-js';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import status from 'http-status';
import { apiFetch } from '../utils/apiFetch';
import { isServerEnvironment } from '../utils/getEnvironment';

type BaseApiFetchArgsWithoutToken = Omit<BaseApiFetchArgs, 'token'>;

export class AuthClient implements IAuthClient {
  public readonly sbAuth?: SupabaseAuthClient;
  private readonly sbClient: SupabaseClient;
  private baseFetchOptions: () => BaseApiFetchArgsWithoutToken;
  private isServer: boolean;
  private token: string | null = null;

  constructor(
    baseFetchOptions: () => BaseApiFetchArgsWithoutToken,
    supabaseClient: SupabaseClient,
    environment: ApiClientConfig['environment']
  ) {
    this.baseFetchOptions = baseFetchOptions;
    this.sbAuth = supabaseClient.auth;
    this.sbClient = supabaseClient;
    this.isServer = isServerEnvironment(environment);

    // Initialize token from current session - MOVE THIS TO THE END
    this._initializeToken();
  }

  // Move all arrow functions BEFORE they're used in constructor
  // Validation helpers
  private _ensureSupabaseAvailable = (operation: string): SupabaseAuthClient => {
    if (!this.sbAuth) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return this.sbAuth;
  };

  private _ensureClientOperation = (operation: string): SupabaseAuthClient => {
    if (this.isServer) {
      throw new Error(`${operation} not available on server`);
    }

    if (!this.sbAuth) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return this.sbAuth;
  };

  private _setToken = (token: string | null): void => {
    this.token = token;
  };

  // Token management
  private _getCurrentToken = async (): Promise<string | null> => {
    const supabase = this._ensureSupabaseAvailable('_getCurrentToken');

    const { data, error } = await supabase.getSession();
    if (error) throw error;

    return data.session?.access_token || null;
  };

  private _syncToken = async (): Promise<void> => {
    const token = await this._getCurrentToken();
    this._setToken(token);
  };

  // Initialization - move to end since it uses other methods
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

    const url = new URL('/api/users/me', apiUrl).toString();

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
      return await this.getMeUser();
    } catch (error) {
      // Clear token on error
      this._setToken(null);
      throw error;
    }
  };

  // Check if email is already registered
  private _isEmailRegistered = async (email: string): Promise<boolean> => {
    const { count, error } = await this.sbClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);

    if (error) throw new AuthError(error.message, status.INTERNAL_SERVER_ERROR, error.code);

    return (count ?? 0) > 0;
  };

  // Check if phone is already registered
  private _isPhoneRegistered = async (phone: string): Promise<boolean> => {
    const { count, error } = await this.sbClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone);

    if (error) throw new AuthError(error.message, status.INTERNAL_SERVER_ERROR, error.code);

    return (count ?? 0) > 0;
  };

  // PUBLIC METHODS (keep at bottom)

  signIn = async (credentials: SignInWithPasswordCredentials): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('signIn');
    const { error } = await supabaseClient.signInWithPassword(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  signInWithIdToken = async (credentials: SignInWithIdTokenCredentials): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('signInWithIdToken');
    const { error } = await supabaseClient.signInWithIdToken(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  signInWithOAuth = async (
    credentials: SignInWithOAuthCredentials
  ): Promise<OAuthResponse['data']> => {
    const supabaseClient = this._ensureSupabaseAvailable('signInWithOAuth');
    const { error, data } = await supabaseClient.signInWithOAuth(credentials);
    if (error) throw error;
    return data;
  };

  signUp = async (credentials: SignUpWithPasswordCredentials): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('signUp');

    // Check if email is already registered
    const email = 'email' in credentials ? credentials.email : null;
    const isEmailExists = email && (await this._isEmailRegistered(email));
    if (isEmailExists) {
      throw new AuthError('Email already taken.', status.CONFLICT, 'email_already_exists');
    }

    const phone = 'phone' in credentials ? credentials.phone : null;
    const isPhoneExists = phone && (await this._isPhoneRegistered(phone));
    if (isPhoneExists) {
      throw new AuthError('Phone number already taken.', status.CONFLICT, 'phone_already_exists');
    }

    const { error } = await supabaseClient.signUp(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  signOut = async (options?: SignOut): Promise<void> => {
    const supabaseClient = this._ensureSupabaseAvailable('signOut');
    const { error } = await supabaseClient.signOut(options);
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
    const supabaseClient = this._ensureSupabaseAvailable('resetPassword');
    const { error } = await supabaseClient.resetPasswordForEmail(email, options);
    if (error) throw error;
  };

  updateEmail = async (email: string): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('updateEmail');
    const { error } = await supabaseClient.updateUser({ email });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  updatePhone = async (phone: string): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('updatePhone');
    const { error } = await supabaseClient.updateUser({ phone });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  updatePassword = async (password: string): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('updatePassword');
    const { error } = await supabaseClient.updateUser({ password });
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  verifyOTP = async (credentials: VerifyOtpParams): Promise<User> => {
    const supabaseClient = this._ensureSupabaseAvailable('verifyOTP');
    const { error } = await supabaseClient.verifyOtp(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  };

  sendVerification = async (params: ResendParams): Promise<void> => {
    const supabaseClient = this._ensureSupabaseAvailable('sendVerification');
    const { error } = await supabaseClient.resend(params);
    if (error) throw error;
  };

  getMeUser = async (): Promise<User> => {
    const { user } = await this._getBackendSession();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  };

  getSession = async () => {
    const supabaseClient = this._ensureSupabaseAvailable('getSession');

    const { data, error } = await supabaseClient.getSession();
    if (error) throw error;
    if (!data.session) return null;

    const backendSession = await this._getBackendSession();
    const { access_token: token, user: _, ...restOfSession } = data.session;

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
    const supabase = this._ensureClientOperation('onAuthStateChange');

    return supabase.onAuthStateChange((event, session) => {
      // Do something here if needed
      this._setToken(session?.access_token || null);

      if (callback) {
        callback(event, session);
      }
    }).data.subscription;
  };

  // Call initialization at the very end or use a separate init method
  initialize = async (): Promise<void> => {
    await this._initializeToken();
  };
}

import { BackendSession, BaseApiFetchArgs, User } from '@lactalink/types';
import { IAuthClient } from '@lactalink/types/interfaces';
import {
  AuthError,
  OAuthResponse,
  ResendParams,
  Session,
  SignInWithIdTokenCredentials,
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  Subscription,
  VerifyOtpParams,
} from '@supabase/supabase-js';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { apiFetch } from '../utils/apiFetch';
import { isServerEnvironment } from '../utils/getEnvironment';

type BaseApiFetchArgsWithoutToken = Omit<BaseApiFetchArgs, 'token'>;

export class AuthClient implements IAuthClient {
  public supabase?: SupabaseAuthClient;
  private baseFetchOptions: () => BaseApiFetchArgsWithoutToken;
  private isServer: boolean;
  private token: string | null = null;

  constructor(
    baseFetchOptions: () => BaseApiFetchArgsWithoutToken,
    supabaseClient: SupabaseAuthClient
  ) {
    this.baseFetchOptions = baseFetchOptions;
    this.supabase = supabaseClient;
    this.isServer = isServerEnvironment();

    // Initialize token from current session
    this._initializeToken();
  }

  // PUBLIC METHODS

  // Auth operations
  async signIn(credentials: SignInWithPasswordCredentials): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('signIn');
    const { error } = await supabaseClient.signInWithPassword(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async signInWithIdToken(credentials: SignInWithIdTokenCredentials): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('signInWithIdToken');
    const { error } = await supabaseClient.signInWithIdToken(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async signInWithOAuth(credentials: SignInWithOAuthCredentials): Promise<OAuthResponse['data']> {
    const supabaseClient = this._ensureSupabaseAvailable('signInWithOAuth');
    const { error, data } = await supabaseClient.signInWithOAuth(credentials);
    if (error) throw error;
    return data;
  }

  async signUp(credentials: SignUpWithPasswordCredentials): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('signUp');
    const { error } = await supabaseClient.signUp(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async signOut(): Promise<void> {
    const supabaseClient = this._ensureSupabaseAvailable('signOut');
    const { error } = await supabaseClient.signOut();
    if (error) throw error;

    // Clear token after sign out
    this._setToken(null);
  }

  async resetPasswordForEmail(
    email: string,
    options?: {
      redirectTo?: string;
      captchaToken?: string;
    }
  ): Promise<void> {
    const supabaseClient = this._ensureSupabaseAvailable('resetPassword');
    const { error } = await supabaseClient.resetPasswordForEmail(email, options);
    if (error) throw error;
  }

  async updateEmail(email: string): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('updateEmail');
    const { error } = await supabaseClient.updateUser({ email });
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async updatePhone(phone: string): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('updatePhone');
    const { error } = await supabaseClient.updateUser({ phone });
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async updatePassword(password: string): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('updatePassword');
    const { error } = await supabaseClient.updateUser({ password });
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async verifyOTP(credentials: VerifyOtpParams): Promise<User> {
    const supabaseClient = this._ensureSupabaseAvailable('verifyOTP');
    const { error } = await supabaseClient.verifyOtp(credentials);
    if (error) throw error;
    return await this._handleAuthSuccess();
  }

  async sendVerification(params: ResendParams): Promise<void> {
    const supabaseClient = this._ensureSupabaseAvailable('sendVerification');
    const { error } = await supabaseClient.resend(params);
    if (error) throw error;
  }

  async getMeUser(): Promise<User> {
    const { user } = await this._getBackendSession();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  async getSession() {
    const supabaseClient = this._ensureSupabaseAvailable('getSession');

    const { data, error } = await supabaseClient.getSession();
    if (error) throw error;
    if (!data.session) return null;

    const backendSession = await this._getBackendSession();
    const { access_token: token, user: _, ...restOfSession } = data.session;

    return { ...restOfSession, ...backendSession, token };
  }

  async getToken(): Promise<string | null> {
    await this._syncToken();
    return this.token;
  }

  // Auth state listener
  onAuthStateChange(callback?: (event: string, session: Session | null) => void): Subscription {
    // Auth state listeners don't work on server - throw error
    const supabase = this._ensureClientOperation('onAuthStateChange');

    return supabase.onAuthStateChange((event, session) => {
      // Do something here if needed
      this._setToken(session?.access_token || null);

      if (callback) {
        callback(event, session);
      }
    }).data.subscription;
  }

  // PRIVATE METHODS

  // Initialization
  private async _initializeToken() {
    try {
      const token = await this._getCurrentToken();
      this._setToken(token);
    } catch (error) {
      // Ignore initialization errors
      console.warn('Failed to initialize token:', error);
    }
  }

  // Token management
  private async _getCurrentToken(): Promise<string | null> {
    const supabase = this._ensureSupabaseAvailable('_getCurrentToken');

    const { data, error } = await supabase.getSession();
    if (error) throw error;

    return data.session?.access_token || null;
  }

  private async _getBackendSession(): Promise<BackendSession> {
    // Ensure we have latest token before making request
    await this._syncToken();

    const fetchOptions = await this._getFetchOptionsWithToken();
    const { url: apiUrl, ...restOfFetchOptions } = fetchOptions;
    const url = new URL('/api/users/me', apiUrl);

    const res = await apiFetch<BackendSession>({
      ...restOfFetchOptions,
      url,
      method: 'GET',
    });

    if ('error' in res) {
      throw new AuthError(res.message, res.status, 'backend_session_error');
    }

    return res.data;
  }

  private async _syncToken(): Promise<void> {
    const token = await this._getCurrentToken();
    this._setToken(token);
  }

  private _setToken(token: string | null) {
    this.token = token;
  }

  // Fetch options
  private async _getFetchOptionsWithToken(): Promise<BaseApiFetchArgs> {
    const baseOptions = this.baseFetchOptions();
    return {
      ...baseOptions,
      token: this.token,
    };
  }

  // Validation helpers
  private _ensureSupabaseAvailable(operation: string): SupabaseAuthClient {
    if (!this.supabase) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return this.supabase;
  }

  private _ensureClientOperation(operation: string): SupabaseAuthClient {
    if (this.isServer) {
      throw new Error(`${operation} not available on server`);
    }

    if (!this.supabase) {
      throw new Error(`Supabase client not available for ${operation}`);
    }
    return this.supabase;
  }

  // Auth flow helpers
  private async _handleAuthSuccess(): Promise<User> {
    try {
      return await this.getMeUser();
    } catch (error) {
      // Clear token on error
      this._setToken(null);
      throw error;
    }
  }
}

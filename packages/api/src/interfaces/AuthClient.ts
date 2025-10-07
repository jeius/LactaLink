import type { BackendSession } from '@lactalink/types/auth';
import type { User } from '@lactalink/types/payload-generated-types';
import type {
  OAuthResponse,
  ResendParams,
  Session,
  SignInWithIdTokenCredentials,
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignOut,
  SignUpWithPasswordCredentials,
  Subscription,
  VerifyOtpParams,
} from '@supabase/supabase-js';
import type { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';

/**
 * Interface defining the contract for authentication client implementations.
 * Provides comprehensive authentication operations, session management, and user operations.
 */
export interface IAuthClient {
  /**
   * Supabase authentication client instance.
   * This is used for direct Supabase authentication operations.
   * @returns SupabaseAuthClient instance
   */
  readonly getSbAuth: () => SupabaseAuthClient;

  /**
   * Creates a new admin user with the specified email and password.
   * @param credentials - Email and password for registration
   * @returns Promise resolving to the created user
   * @throws AuthError if user creation fails
   */
  createAdminUser: (credentials: SignUpWithPasswordCredentials) => Promise<User>;

  /**
   * Authenticates a user with email and password credentials.
   * @param credentials - Email and password for sign in
   * @returns Promise resolving to the authenticated user
   * @throws AuthError if authentication fails
   */
  signIn(credentials: SignInWithPasswordCredentials): Promise<User>;

  /**
   * Authenticates a user with ID token credentials (e.g., from Google Sign-In).
   * @param credentials - ID token credentials for sign in
   * @returns Promise resolving to the authenticated user
   * @throws AuthError if authentication fails
   */
  signInWithIdToken(credentials: SignInWithIdTokenCredentials): Promise<User>;

  /**
   * Initiates OAuth sign-in flow with the specified provider.
   * @param credentials - OAuth credentials including provider and options
   * @returns Promise resolving to OAuth response data (URL, provider, etc.)
   * @throws AuthError if OAuth initiation fails
   */
  signInWithOAuth(
    credentials: SignInWithOAuthCredentials
  ): Promise<Extract<OAuthResponse['data'], { url: string }>>;

  /**
   * Registers a new user with email and password credentials.
   * @param credentials - Email and password for registration
   * @returns Promise resolving to an object containing user ID, email, and phone
   * @throws AuthError if registration fails
   */
  signUp(credentials: SignUpWithPasswordCredentials): Promise<Pick<User, 'id' | 'email' | 'phone'>>;

  /**
   * Signs out the current user and clears the authentication token.
   * @returns Promise that resolves when sign out is complete
   * @throws AuthError if sign out fails
   */
  signOut(options?: SignOut): Promise<void>;

  /**
   * Sends a password reset email to the specified email address.
   * @param email - The email address to send the reset link to
   * @param options - Optional parameters for the reset request
   * @param options.redirectTo - URL to redirect to after password reset
   * @param options.captchaToken - Captcha token for verification
   * @returns Promise that resolves when the email is sent
   * @throws AuthError if the request fails
   */
  resetPasswordForEmail(
    email: string,
    options?: {
      redirectTo?: string;
      captchaToken?: string;
    }
  ): Promise<void>;

  /**
   * Updates the current user's email address.
   * @param email - The new email address
   * @returns Promise resolving to the updated user
   * @throws AuthError if the update fails
   */
  updateEmail(email: string): Promise<User>;

  /**
   * Updates the current user's phone number.
   * @param phone - The new phone number
   * @returns Promise resolving to the updated user
   * @throws AuthError if the update fails
   */
  updatePhone(phone: string): Promise<User>;

  /**
   * Updates the current user's password.
   * @param password - The new password
   * @returns Promise resolving to the updated user
   * @throws AuthError if the update fails
   */
  updatePassword(password: string): Promise<User>;

  /**
   * Verifies a one-time password (OTP) for authentication or verification.
   * @param credentials - OTP verification parameters
   * @returns Promise resolving to the verified user
   * @throws AuthError if verification fails
   */
  verifyOTP(credentials: VerifyOtpParams): Promise<User>;

  /**
   * Resends a verification message (email or SMS).
   * @param params - Parameters for the resend request
   * @returns Promise that resolves when the message is sent
   * @throws AuthError if the request fails
   */
  sendVerification(params: ResendParams): Promise<void>;

  /**
   * Retrieves the current authenticated user from the backend.
   * @returns Promise resolving to the current user or null if not authenticated
   *
   */
  getMeUser(): Promise<User | null>;

  /**
   * Retrieves the current session combining Supabase and backend session data.
   * @returns Promise resolving to the complete session or null if not authenticated
   * @throws AuthError if session retrieval fails
   */
  getSession(): Promise<
    (Omit<Session, 'access_token' | 'user'> & BackendSession & { token: string }) | null
  >;

  /**
   * Retrieves the current authentication token.
   * @returns Promise resolving to the token string or null if not authenticated
   */
  getToken(): Promise<string | null>;

  /**
   * Sets up a listener for authentication state changes.
   * Note: This method is only available on client-side, throws error on server.
   * @param callback - Optional callback function to handle auth state changes
   * @returns Subscription object that can be used to unsubscribe
   * @throws Error if called on server-side or Supabase client is not available
   */
  onAuthStateChange(callback?: (event: string, session: Session | null) => void): Subscription;
}

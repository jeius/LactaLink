import { VerifyOtpSearchParams } from '@lactalink/types/auth';

export type MapPageSearchParams = {
  mrk?: string;
  lat?: string;
  lng?: string;
  title?: string;
};

export type FeedCommentsSearchParams = {
  post: string;
};

export type RedirectSearchParams = {
  redirect?: string;
};

export type OTPSearchParams = VerifyOtpSearchParams & RedirectSearchParams;

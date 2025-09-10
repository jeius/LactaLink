declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string;
      DATABASE_URI: string;
      NEXT_PUBLIC_SERVER_URL: string;
      VERCEL_PROJECT_PRODUCTION_URL: string;
      VERCEL_ENV: 'production' | 'preview' | 'development';
      S3_BUCKET_IMAGES: string;
      S3_BUCKET_MEDIA: string;
      S3_BUCKET_FILES: string;
      S3_BUCKET_AVATARS: string;
      S3_BUCKET_MILK_BAG_IMAGES: string;
      S3_ACCESS_KEY_ID: string;
      S3_SECRET_ACCESS_KEY: string;
      S3_ENDPOINT: string;
      S3_REGION: string;
      RESEND_API_KEY: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      PSGC_API_URL: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      VERCEL_AUTOMATION_BYPASS_SECRET?: string;
      GOOGLE_CLOUD_VISION_API_KEY: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};

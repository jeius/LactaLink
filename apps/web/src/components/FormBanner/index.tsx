export interface FormBannerProps {
  message?: string | null;
  status?: 'success' | 'failed';
}

export const FormBanner: React.FC<FormBannerProps> = ({ message, status }) => {
  return (
    <div className="flex min-h-16 w-full max-w-md flex-col gap-2 text-sm">
      {status === 'success' && message && (
        <div className="text-success-800 bg-success-500/40 rounded-lg p-6">
          <p className="text-center">{message}</p>
        </div>
      )}
      {status === 'failed' && message && (
        <div className="text-error-800 bg-error-500/40 rounded-lg p-6">
          <p className="text-center">{message}</p>
        </div>
      )}
    </div>
  );
};

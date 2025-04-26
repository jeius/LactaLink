import { signInSchema, SignInSchema } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthError, AuthSuccess } from '@lactalink/types/auth';
import { useForm } from 'react-hook-form';

type SignInFormParams = {
  defaultValues?: SignInSchema;
  apiUrl: string;
  onSuccess?: (data: AuthSuccess) => void | Promise<void>;
  onError?: (error: AuthError) => void | Promise<void>;
};

export function signInForm(params: SignInFormParams) {
  const { defaultValues = { email: '', password: '' }, apiUrl, onError, onSuccess } = params;

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  async function onSubmit(formData: SignInSchema) {
    const res = await fetch(new URL('/api/users/login', apiUrl), {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const authError = (await res.json()) as AuthError;
      if (onError) await onError(authError);
    } else {
      const authSuccess = (await res.json()) as AuthSuccess;
      if (onSuccess) await onSuccess(authSuccess);
    }
  }

  return { form, onSubmit };
}

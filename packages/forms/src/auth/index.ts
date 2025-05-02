import { signInSchema, SignInSchema } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function signInForm(defaultValues: SignInSchema = { email: '', password: '' }) {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  return form;
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { isApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import type { LoginRedirectState } from '@/context/auth-provider';
import { useAuth } from '@/hooks/use-auth';
import { applyApiErrors } from '@/lib/form-errors';
import { getMockReason } from '@/lib/mock-mode';
import { loginSchema, type LoginValues } from '@/lib/schemas';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const { login } = useAuth();
  const location = useLocation();
  const expired = (location.state as LoginRedirectState | null)?.reason === 'expired';
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  // On success the public-only route redirects to the original page or My Tasks.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
    } catch (error) {
      if (isApiError(error, 401)) setFormError('Invalid email or password');
      else setFormError(applyApiErrors(error, setError, ['email', 'password']));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {expired && !formError && <FormAlert tone="info">Your session has ended. Log in again to continue.</FormAlert>}
      {getMockReason() && (
        <FormAlert tone="info">
          Demo mode: use a seeded account such as <strong>maya@taskflow.dev</strong> with password{' '}
          <strong>Password123!</strong>
        </FormAlert>
      )}
      {formError && <FormAlert>{formError}</FormAlert>}

      <Field label="Email" required error={errors.email?.message}>
        {(control) => <Input {...control} {...register('email')} type="email" autoComplete="email" autoFocus />}
      </Field>
      <Field label="Password" required error={errors.password?.message}>
        {(control) => <PasswordInput {...control} {...register('password')} autoComplete="current-password" />}
      </Field>

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}

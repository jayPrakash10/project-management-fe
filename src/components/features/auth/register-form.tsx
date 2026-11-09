import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { isApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { LIMITS } from '@/lib/constants';
import { applyApiErrors } from '@/lib/form-errors';
import { registerSchema, type RegisterValues } from '@/lib/schemas';
import { PasswordInput } from './password-input';

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setEmailTaken(false);
    try {
      await registerAccount(values);
    } catch (error) {
      if (isApiError(error, 409)) {
        setEmailTaken(true);
        setError('email', { type: 'server', message: error.message });
        return;
      }
      setFormError(applyApiErrors(error, setError, ['name', 'email', 'password']));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {formError && <FormAlert>{formError}</FormAlert>}

      <Field label="Name" required error={errors.name?.message}>
        {(control) => <Input {...control} {...register('name')} autoComplete="name" autoFocus maxLength={LIMITS.userName} />}
      </Field>
      <Field
        label="Email"
        required
        error={errors.email?.message}
        hint={
          emailTaken ? undefined : 'Project owners add you to projects using this address.'
        }
      >
        {(control) => <Input {...control} {...register('email')} type="email" autoComplete="email" maxLength={LIMITS.email} />}
      </Field>
      {emailTaken && (
        <p className="-mt-2 text-sm text-fg-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in instead
          </Link>
        </p>
      )}
      <Field label="Password" required error={errors.password?.message} hint={`${LIMITS.passwordMin}–${LIMITS.passwordMax} characters.`}>
        {(control) => (
          <PasswordInput {...control} {...register('password')} autoComplete="new-password" maxLength={LIMITS.passwordMax} />
        )}
      </Field>

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}

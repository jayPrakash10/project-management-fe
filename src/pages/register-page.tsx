import { Link } from 'react-router';
import { AuthLayout } from '@/components/features/auth/auth-layout';
import { RegisterForm } from '@/components/features/auth/register-form';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Plan work, track tasks, and collaborate with your team."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}

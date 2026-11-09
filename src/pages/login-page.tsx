import { Link } from 'react-router';
import { AuthLayout } from '@/components/features/auth/auth-layout';
import { LoginForm } from '@/components/features/auth/login-form';

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your tasks and projects."
      footer={
        <>
          New to TaskFlow?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}

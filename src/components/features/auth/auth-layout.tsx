import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/logo';
import { ThemePicker } from '@/components/features/settings/theme-picker';
import { DemoBanner } from '@/components/layout/demo-banner';

/** Centered card used by the login and sign-up screens. */
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <DemoBanner />
      <div className="flex justify-end p-3">
        <ThemePicker />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Link to="/" aria-label="TaskFlow home" className="rounded-md">
              <Logo className="text-fg" />
            </Link>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">{title}</h1>
            <p className="mt-1 text-base text-fg-muted">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">{children}</div>
          <p className="mt-6 text-center text-base text-fg-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}

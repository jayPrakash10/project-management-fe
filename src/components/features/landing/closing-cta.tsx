import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { buttonStyles } from '@/components/ui/button-styles';
import { Logo } from '@/components/layout/logo';

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-heading" className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="rounded-xl border border-transparent bg-sidebar px-6 dark:border-border dark:bg-surface-2 py-14 text-center sm:px-12">
          <h2 id="cta-heading" className="text-2xl font-bold tracking-tight text-balance text-sidebar-fg sm:text-3xl">
            Ready to get your projects moving?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-md text-sidebar-muted">
            Create an account in a minute. Your project owner can add you as soon as you’re in.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
              Create your account
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              to="/login"
              className={buttonStyles({
                variant: 'ghost',
                size: 'lg',
                className: 'text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg',
              })}
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-fg-muted sm:flex-row md:px-6">
        <Logo className="text-fg" />
        <nav aria-label="Footer">
          <ul className="flex gap-4">
            <li>
              <Link to="/login" className="hover:text-fg hover:underline">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-fg hover:underline">
                Sign up
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

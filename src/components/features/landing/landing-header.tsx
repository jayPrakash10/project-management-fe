import { Link } from 'react-router';
import { ThemePicker } from '@/components/features/settings/theme-picker';
import { Logo } from '@/components/layout/logo';
import { buttonStyles } from '@/components/ui/button-styles';

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#roles', label: 'Roles' },
  { href: '#themes', label: 'Themes' },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:px-6">
        <Link to="/" aria-label="TaskFlow home" className="text-fg">
          <Logo />
        </Link>
        <nav aria-label="Page sections" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="rounded-md px-3 py-2 text-base text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemePicker />
          <Link to="/login" className={buttonStyles({ variant: 'ghost' })}>
            Log in
          </Link>
          <Link to="/register" className={buttonStyles({ variant: 'primary', className: 'hidden sm:inline-flex' })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

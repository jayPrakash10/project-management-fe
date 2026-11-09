import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { buttonStyles } from '@/components/ui/button-styles';
import { BoardPreview } from './board-preview';

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-linear-to-b from-accent-soft to-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-24 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:pt-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-fg-muted shadow-xs">
            <span aria-hidden className="size-2 rounded-full bg-accent" />
            Boards, lists and a home for your tasks
          </p>
          <h1 id="hero-heading" className="text-3xl font-bold tracking-tight text-balance text-fg sm:text-4xl">
            Plan the work. Track every task. Ship together.
          </h1>
          <p className="mt-5 max-w-xl text-md text-pretty text-fg-muted">
            TaskFlow keeps your team’s projects in one place: organize tasks into board columns, set priorities and due
            dates, assign owners, and talk it through in comments.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
              Create your account
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link to="/login" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Log in
            </Link>
          </div>
          <p className="mt-4 text-sm text-fg-subtle">Already invited? Sign up with the email your project owner used.</p>
        </div>
        <BoardPreview />
      </div>
    </section>
  );
}

import { ThemeOptions } from '@/components/features/settings/theme-options';
import { PriorityBadge, StatusBadge } from '@/components/features/tasks/task-badges';
import { Avatar } from '@/components/ui/avatar';
import { buttonStyles } from '@/components/ui/button-styles';
import { SectionHeading } from './section-heading';

/** Live theme controls: changing them restyles this whole page (and is remembered for the app). */
export function ThemeShowcase() {
  return (
    <section id="themes" aria-labelledby="themes-heading" className="scroll-mt-20 border-y border-border bg-surface py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="themes-heading"
            align="left"
            eyebrow="Themes"
            title="Make it yours"
            description="Pick light, dark or match your system, then choose one of six accent colors. Try it here: the whole page updates, and TaskFlow remembers your choice."
          />
          <div className="mt-8 max-w-md rounded-xl border border-border bg-bg p-5">
            <ThemeOptions size="lg" />
          </div>
        </div>

        <div aria-hidden className="rounded-xl border border-border bg-bg p-5 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold text-fg">Launch checklist</p>
            <span className={buttonStyles({ variant: 'primary', size: 'sm' })}>New task</span>
          </div>
          <div className="mt-4 space-y-2">
            {(
              [
                ['Finalize release notes', 'urgent', 'in_progress', 'Omar Haddad'],
                ['QA the signup flow', 'high', 'in_review', 'Leo Martins'],
                ['Publish blog post', 'medium', 'todo', 'Sara Lindqvist'],
              ] as const
            ).map(([title, priority, status, assignee]) => (
              <div key={title} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                <span className="size-4 shrink-0 rounded-full border border-border-strong" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{title}</span>
                <span className="hidden sm:inline-flex">
                  <PriorityBadge priority={priority} />
                </span>
                <StatusBadge status={status} />
                <Avatar name={assignee} size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-sm">
              <span className="text-fg-muted">Complete</span>
              <span className="font-semibold text-fg tabular-nums">60%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-3/5 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { BarChart3, CalendarClock, Columns3, Keyboard, MessagesSquare, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionHeading } from './section-heading';

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <Columns3 />,
    title: 'Boards that move with you',
    body: 'Drag tasks between columns. Drop one into “Done” and it’s marked complete. Owners can add, rename and reorder sections.',
  },
  {
    icon: <CalendarClock />,
    title: 'My Tasks, by deadline',
    body: 'Everything assigned to you across every project, split into Overdue, Today, This week, All open and Completed.',
  },
  {
    icon: <SlidersHorizontal />,
    title: 'Filter, search and sort',
    body: 'Narrow any project by status, priority, assignee or due date, search titles, and sort by priority, due date or age.',
  },
  {
    icon: <MessagesSquare />,
    title: 'Comments and activity',
    body: 'Discuss each task in its comment thread, and follow a project’s timeline: new tasks, assignments, status changes.',
  },
  {
    icon: <BarChart3 />,
    title: 'Project overview',
    body: 'See total tasks, the share in each status, what’s overdue and the percentage complete at a glance.',
  },
  {
    icon: <Keyboard />,
    title: 'Built for the keyboard',
    body: 'N for a new task, / to search, Esc to close, ? for help. Every control works with a keyboard and screen reader.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" aria-labelledby="features-heading" className="scroll-mt-20 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Everything a team needs to keep work moving"
          description="A focused set of tools for planning, tracking and finishing projects."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <span aria-hidden className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-fg [&>svg]:size-5">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-md font-semibold text-fg">{feature.title}</h3>
              <p className="mt-2 text-base text-fg-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

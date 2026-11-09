import { Check, Crown, ShieldCheck, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionHeading } from './section-heading';

/** Mirrors the permission rules in FRONTEND_GUIDE.md §4. */
const ROLES: { icon: ReactNode; name: string; summary: string; abilities: string[] }[] = [
  {
    icon: <User />,
    name: 'Member',
    summary: 'Everyone starts here.',
    abilities: [
      'Work in the projects you’re added to',
      'Create tasks and edit their details',
      'Change status and leave comments',
      'See each project’s overview and activity',
    ],
  },
  {
    icon: <Crown />,
    name: 'Manager',
    summary: 'Runs the projects they create.',
    abilities: [
      'Everything a member can do',
      'Create new projects and own them',
      'In their projects: add and remove members',
      'In their projects: assign tasks, manage sections, delete tasks',
    ],
  },
  {
    icon: <ShieldCheck />,
    name: 'Admin',
    summary: 'Looks after the workspace.',
    abilities: [
      'Everything a manager can do',
      'See and manage every project',
      'Change anyone’s role from the Users screen',
      'Remove any comment',
    ],
  },
];

export function RolesSection() {
  return (
    <section id="roles" aria-labelledby="roles-heading" className="scroll-mt-20 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          id="roles-heading"
          eyebrow="Roles"
          title="The right access for everyone"
          description="Three simple roles. Each person only sees the actions they can actually take."
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role.name} className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <span aria-hidden className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-fg [&>svg]:size-5">
                  {role.icon}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-fg">{role.name}</h3>
                  <p className="text-sm text-fg-muted">{role.summary}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {role.abilities.map((ability) => (
                  <li key={ability} className="flex items-start gap-2 text-base text-fg">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                    {ability}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

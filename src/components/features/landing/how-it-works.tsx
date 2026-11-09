import { SectionHeading } from './section-heading';

const STEPS = [
  {
    title: 'Create a project',
    body: 'A manager or admin starts a project. It comes ready with To Do, In Progress and Done columns.',
  },
  {
    title: 'Invite your team',
    body: 'Add teammates by email. Everyone in the project can create tasks, update them and comment.',
  },
  {
    title: 'Track it to done',
    body: 'Assign owners, set due dates, move cards across the board and watch the completion percentage climb.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 border-y border-border bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading id="how-heading" eyebrow="How it works" title="From idea to done in three steps" />
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-full bg-accent text-md font-semibold text-on-accent tabular-nums"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-base text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

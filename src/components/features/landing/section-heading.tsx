import { cn } from '@/lib/cn';

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="text-sm font-semibold tracking-wide text-accent-soft-fg uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight text-balance text-fg sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-md text-pretty text-fg-muted">{description}</p>}
    </div>
  );
}

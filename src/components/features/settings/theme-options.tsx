import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useId } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';
import { ACCENTS, THEME_MODES, type ThemeMode } from '@/lib/theme';

const modeIcons: Record<ThemeMode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

/** Mode (light / dark / system) and accent palette as native radio groups. Safe to render more than once. */
export function ThemeOptions({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { mode, accent, setMode, setAccent } = useTheme();
  const groupId = useId();
  const large = size === 'lg';

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg">Mode</legend>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1">
          {THEME_MODES.map((option) => {
            const Icon = modeIcons[option.value];
            return (
              <label key={option.value} className="relative">
                <input
                  type="radio"
                  name={`${groupId}-mode`}
                  value={option.value}
                  checked={mode === option.value}
                  onChange={() => setMode(option.value)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium text-fg-muted transition-colors',
                    large ? 'h-10 text-base' : 'h-8 text-sm',
                    'peer-checked:bg-surface peer-checked:text-fg peer-checked:shadow-xs hover:text-fg',
                    'peer-focus-visible:outline-2 peer-focus-visible:outline-accent',
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg">Accent color</legend>
        <div className={cn('grid grid-cols-6', large ? 'gap-3' : 'gap-2')}>
          {ACCENTS.map((option) => (
            <label key={option.value} className="flex flex-col items-center gap-1.5" title={option.label}>
              <input
                type="radio"
                name={`${groupId}-accent`}
                value={option.value}
                checked={accent === option.value}
                onChange={() => setAccent(option.value)}
                className="peer sr-only"
              />
              <span
                data-accent={option.value}
                aria-hidden
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent transition-transform hover:scale-105',
                  large ? 'size-10' : 'size-8',
                  'ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-fg',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent',
                )}
              >
                {accent === option.value && <Check className="size-4" />}
              </span>
              <span className={cn(large ? 'text-xs text-fg-muted' : 'sr-only')}>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

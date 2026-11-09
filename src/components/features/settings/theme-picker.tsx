import { Palette } from 'lucide-react';
import { Popover } from '@/components/ui/popover';
import { ThemeOptions } from './theme-options';

/** Top-bar button that opens the appearance options. */
export function ThemePicker() {
  return (
    <Popover label="Appearance" trigger={<Palette className="size-5" />}>
      <ThemeOptions />
    </Popover>
  );
}

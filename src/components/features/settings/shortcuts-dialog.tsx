import { Kbd } from '@/components/ui/kbd';
import { Modal } from '@/components/ui/modal';

const SHORTCUTS = [
  { keys: ['N'], description: 'New task (inside a project)' },
  { keys: ['/'], description: 'Focus the search box' },
  { keys: ['Esc'], description: 'Close the task panel or a dialog' },
  { keys: ['?'], description: 'Show this list' },
  { keys: ['Ctrl', 'Enter'], description: 'Send a comment' },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" size="sm">
      <dl className="divide-y divide-border">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.description} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-base text-fg">{shortcut.description}</dt>
            <dd className="flex shrink-0 gap-1">
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-fg-subtle">Shortcuts are ignored while you’re typing in a field.</p>
    </Modal>
  );
}

import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { DropdownMenu, type MenuItem } from '@/components/ui/dropdown-menu';
import { useRenameSection } from '@/hooks/use-sections';
import { cn } from '@/lib/cn';
import type { Section, Task } from '@/types/api';
import { NO_SECTION_ID, columnId } from './board-ids';
import { QuickAddTask } from './quick-add-task';
import { SectionNameForm } from './section-name-form';
import { DraggableTaskCard } from './task-card';


interface ColumnFrameProps {
  title: ReactNode;
  count: number;
  isOver: boolean;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  frameRef?: (node: HTMLElement | null) => void;
  dragging?: boolean;
  headingId: string;
}

function ColumnFrame({ title, count, isOver, header, children, footer, style, frameRef, dragging, headingId }: ColumnFrameProps) {
  return (
    <section
      ref={frameRef}
      style={style}
      aria-labelledby={headingId}
      className={cn(
        'flex w-[85vw] max-w-80 shrink-0 snap-start flex-col rounded-xl bg-surface-2 sm:w-72',
        isOver && 'ring-2 ring-accent',
        dragging && 'opacity-60',
      )}
    >
      <header className="flex min-h-12 items-center gap-1.5 px-3 pt-2">
        <h2 id={headingId} className="min-w-0 truncate text-base font-semibold text-fg">
          {title}
        </h2>
        <span className="rounded-full bg-surface-3 px-2 text-xs leading-5 font-medium text-fg-muted tabular-nums">
          <span className="sr-only">Tasks: </span>
          {count}
        </span>
        <div className="ml-auto flex items-center">{header}</div>
      </header>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {children}
        {footer}
      </div>
    </section>
  );
}

function TaskStack({ tasks, onOpen }: { tasks: Task[]; onOpen: (taskId: string) => void }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-strong px-3 py-6 text-center text-sm text-fg-subtle">
        No tasks here
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <DraggableTaskCard key={task.id} task={task} onOpen={onOpen} />
      ))}
    </ul>
  );
}

export interface SectionColumnProps {
  section: Section;
  tasks: Task[];
  projectId: string;
  canManage: boolean;
  isFirst: boolean;
  isLast: boolean;
  onOpenTask: (taskId: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}

/** A real section: sortable (owner/admin), droppable for tasks, with rename/move/delete. */
export function SectionColumn({ section, tasks, projectId, canManage, isFirst, isLast, onOpenTask, onMove, onDelete }: SectionColumnProps) {
  const [renaming, setRenaming] = useState(false);
  const renameSection = useRenameSection(projectId);
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging, isOver, active } =
    useSortable({
      id: columnId(section.id),
      data: { type: 'column', sectionId: section.id },
      disabled: { draggable: !canManage, droppable: false },
    });

  const taskIsOver = isOver && active?.data.current?.type === 'task';

  const menuItems: MenuItem[] = [
    { label: 'Rename section', icon: <Pencil />, onSelect: () => setRenaming(true) },
    { label: 'Move left', icon: <ArrowLeft />, onSelect: () => onMove(-1), disabled: isFirst },
    { label: 'Move right', icon: <ArrowRight />, onSelect: () => onMove(1), disabled: isLast },
    { label: 'Delete section', icon: <Trash2 />, tone: 'danger', onSelect: onDelete },
  ];

  return (
    <ColumnFrame
      frameRef={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      dragging={isDragging}
      isOver={taskIsOver}
      count={tasks.length}
      headingId={`column-heading-${section.id}`}
      title={
        renaming ? (
          <SectionNameForm
            label={`Rename section ${section.name}`}
            initialName={section.name}
            submitLabel="Save"
            pending={renameSection.isPending}
            onCancel={() => setRenaming(false)}
            onSubmit={(name, { onError }) =>
              renameSection.mutate({ sectionId: section.id, name }, { onSuccess: () => setRenaming(false), onError })
            }
          />
        ) : (
          section.name
        )
      }
      header={
        canManage &&
        !renaming && (
          <>
            <button
              ref={setActivatorNodeRef}
              type="button"
              {...attributes}
              {...listeners}
              aria-label={`Reorder section ${section.name}`}
              title="Drag to reorder"
              className="flex size-7 cursor-grab items-center justify-center rounded text-fg-subtle hover:bg-surface-3 hover:text-fg"
            >
              <GripVertical aria-hidden className="size-4" />
            </button>
            <DropdownMenu label={`Actions for section ${section.name}`} trigger={<MoreHorizontal className="size-4" />} items={menuItems} />
          </>
        )
      }
      footer={<QuickAddTask projectId={projectId} sectionId={section.id} sectionName={section.name} />}
    >
      <TaskStack tasks={tasks} onOpen={onOpenTask} />
    </ColumnFrame>
  );
}

/** Tasks whose section was deleted (sectionId null). Droppable but not sortable. */
export function NoSectionColumn({ tasks, onOpenTask }: { tasks: Task[]; onOpenTask: (taskId: string) => void }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: NO_SECTION_ID, data: { type: 'column', sectionId: null } });
  return (
    <ColumnFrame
      frameRef={setNodeRef}
      isOver={isOver && active?.data.current?.type === 'task'}
      count={tasks.length}
      headingId="column-heading-none"
      title={<span className="text-fg-muted italic">No section</span>}
    >
      <TaskStack tasks={tasks} onOpen={onOpenTask} />
    </ColumnFrame>
  );
}

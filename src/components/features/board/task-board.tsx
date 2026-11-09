import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { getErrorMessage } from '@/api/errors';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteSection, useReorderSections } from '@/hooks/use-sections';
import { useMoveTask } from '@/hooks/use-task-mutations';
import { useToast } from '@/hooks/use-toast';
import { groupTasksBySection, isDoneSection } from '@/lib/tasks';
import type { Section, Task, TaskStatus } from '@/types/api';
import { AddSectionColumn } from './add-section-column';
import { NoSectionColumn, SectionColumn } from './board-column';
import { columnId } from './board-ids';
import { TaskCardContent } from './task-card';

export interface TaskBoardProps {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  canManage: boolean;
  onOpenTask: (taskId: string) => void;
}

/** Tasks use pointer position; columns use the closest column center. */
const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === 'column') {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.data.current?.type === 'column' && container.data.current.sectionId !== null,
      ),
    });
  }
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};

/**
 * Drag rule (product decision 4b): dropping into a section named "Done" marks the
 * task done; dragging a done task out of "Done" reopens it as "To do".
 */
function statusForMove(task: Task, from: Section | undefined, to: Section | undefined): TaskStatus | undefined {
  if (isDoneSection(to) && task.status !== 'done') return 'done';
  if (isDoneSection(from) && !isDoneSection(to) && task.status === 'done') return 'todo';
  return undefined;
}

export function TaskBoard({ projectId, sections, tasks, canManage, onOpenTask }: TaskBoardProps) {
  const toast = useToast();
  const moveTask = useMoveTask(projectId);
  const reorderSections = useReorderSections(projectId);
  const deleteSection = useDeleteSection(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groups = groupTasksBySection(sections, tasks);
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const sectionIds = sections.map((section) => columnId(section.id));

  function nameForId(id: string | number): string {
    const key = String(id);
    if (key.startsWith('column:')) {
      const section = sectionById.get(key.slice('column:'.length));
      return section ? `section ${section.name}` : 'No section';
    }
    const task = tasks.find((item) => item.id === key);
    return task ? `task ${task.title}` : 'item';
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameForId(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameForId(active.id)} is over ${nameForId(over.id)}.` : `${nameForId(active.id)} is no longer over a column.`,
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${nameForId(active.id)} on ${nameForId(over.id)}.` : `${nameForId(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Moving ${nameForId(active.id)} was cancelled.`,
  };

  function reorder(orderedIds: string[]) {
    reorderSections.mutate({ orderedIds, before: sections }, {
      onError: (error) => toast.error(`Couldn’t reorder sections: ${getErrorMessage(error)}`),
    });
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const ids = sections.map((section) => section.id);
    const index = ids.indexOf(sectionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    reorder(arrayMove(ids, index, target));
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'task') setActiveTask(event.active.data.current.task as Task);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;
    const activeType = active.data.current?.type;

    if (activeType === 'task') {
      const task = active.data.current?.task as Task;
      const targetSectionId = (over.data.current?.sectionId ?? null) as string | null;
      const currentSectionId = task.sectionId && sectionById.has(task.sectionId) ? task.sectionId : null;
      if (targetSectionId === currentSectionId) return;

      const from = currentSectionId ? sectionById.get(currentSectionId) : undefined;
      const to = targetSectionId ? sectionById.get(targetSectionId) : undefined;
      const status = statusForMove(task, from, to);
      moveTask.mutate(
        { task, sectionId: targetSectionId, status },
        { onError: (error) => toast.error(`Couldn’t move “${task.title}”: ${getErrorMessage(error)}`) },
      );
      return;
    }

    if (activeType === 'column' && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(String(active.id));
      const newIndex = sectionIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      reorder(arrayMove(sections.map((section) => section.id), oldIndex, newIndex));
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              'To pick up an item, press Space or Enter. Use the arrow keys to move it to another column. Press Space or Enter again to drop it, or Escape to cancel.',
          },
        }}
      >
        <div className="scrollbar-thin flex flex-1 snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-6 md:snap-none md:px-6 lg:px-8">
          <SortableContext items={sectionIds} strategy={horizontalListSortingStrategy}>
            {groups.map((group, index) =>
              group.section ? (
                <SectionColumn
                  key={group.section.id}
                  section={group.section}
                  tasks={group.tasks}
                  projectId={projectId}
                  canManage={canManage}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                  onOpenTask={onOpenTask}
                  onMove={(direction) => moveSection(group.section?.id ?? '', direction)}
                  onDelete={() => setSectionToDelete(group.section)}
                />
              ) : (
                <NoSectionColumn key="no-section" tasks={group.tasks} onOpenTask={onOpenTask} />
              ),
            )}
          </SortableContext>
          {canManage && <AddSectionColumn projectId={projectId} />}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-72 cursor-grabbing">
              <TaskCardContent task={activeTask} onOpen={() => undefined} overlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <ConfirmDialog
        open={sectionToDelete !== null}
        title="Delete this section?"
        description={
          <>
            The “{sectionToDelete?.name}” column will be removed. Its tasks are kept and move to <strong>No section</strong>.
          </>
        }
        confirmLabel="Delete section"
        loading={deleteSection.isPending}
        error={deleteSection.isError ? getErrorMessage(deleteSection.error) : null}
        onCancel={() => {
          setSectionToDelete(null);
          deleteSection.reset();
        }}
        onConfirm={() => {
          if (!sectionToDelete) return;
          deleteSection.mutate(sectionToDelete.id, {
            onSuccess: () => {
              toast.success(`Section “${sectionToDelete.name}” deleted`);
              setSectionToDelete(null);
            },
          });
        }}
      />
    </>
  );
}

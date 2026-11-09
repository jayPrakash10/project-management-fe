import type { Section, SortOrder, Task, TaskSortBy } from '@/types/api';
import { PRIORITY_RANK } from './constants';

/** Sections ordered as the API orders them: position, then creation time. */
export function sortSections(sections: Section[]): Section[] {
  return [...sections].sort(
    (a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt),
  );
}

/** Drag rule: dropping a card into a section named "Done" also marks it done. */
export function isDoneSection(section: Pick<Section, 'name'> | undefined | null): boolean {
  return section?.name.trim().toLowerCase() === 'done';
}

export interface TaskGroup {
  /** null = the "No section" group. */
  section: Section | null;
  tasks: Task[];
}

/** One group per section, plus "No section" when any task has sectionId null. */
export function groupTasksBySection(sections: Section[], tasks: Task[]): TaskGroup[] {
  const ordered = sortSections(sections);
  const known = new Set(ordered.map((section) => section.id));
  const groups: TaskGroup[] = ordered.map((section) => ({
    section,
    tasks: tasks.filter((task) => task.sectionId === section.id),
  }));
  const orphans = tasks.filter((task) => task.sectionId === null || !known.has(task.sectionId));
  if (orphans.length > 0) groups.push({ section: null, tasks: orphans });
  return groups;
}

/** Same ordering rules as the API (dueDate puts tasks without a date last). */
export function compareTasks(sortBy: TaskSortBy, order: SortOrder) {
  const direction = order === 'asc' ? 1 : -1;
  return (a: Task, b: Task): number => {
    if (sortBy === 'dueDate') {
      if (a.dueDate === b.dueDate) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate) * direction;
    }
    if (sortBy === 'priority') {
      const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (diff !== 0) return diff * direction;
      return b.createdAt.localeCompare(a.createdAt);
    }
    return a.createdAt.localeCompare(b.createdAt) * direction;
  };
}

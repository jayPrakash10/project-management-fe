import { useOutletContext } from 'react-router';
import type { Project, ProjectMember } from '@/types/api';

/** Shared with every project tab by <ProjectLayout>. */
export interface ProjectOutletContext {
  project: Project;
  members: ProjectMember[] | undefined;
  /** Owner or admin. */
  canManage: boolean;
}

export function useProjectOutlet() {
  return useOutletContext<ProjectOutletContext>();
}

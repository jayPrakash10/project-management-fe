import { getPermissions } from '@/lib/permissions';
import type { Project } from '@/types/api';
import { useAuth } from './use-auth';

/** Permission flags for the current user, optionally scoped to a project. */
export function usePermissions(project?: Project | null) {
  const { user } = useAuth();
  return getPermissions(user, project);
}

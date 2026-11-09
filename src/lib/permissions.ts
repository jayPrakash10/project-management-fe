import type { Comment, Project, User } from '@/types/api';

/** Permission flags from FRONTEND_GUIDE.md §4. The server still enforces everything. */
export interface Permissions {
  isAdmin: boolean;
  canCreateProject: boolean;
  /** Owner or admin of the given project. */
  canManageProject: boolean;
}

export function getPermissions(user: User | null, project?: Project | null): Permissions {
  const isAdmin = user?.role === 'admin';
  return {
    isAdmin,
    canCreateProject: user?.role === 'admin' || user?.role === 'manager',
    canManageProject: Boolean(user && project && (isAdmin || project.ownerId === user.id)),
  };
}

export function canDeleteComment(user: User | null, comment: Comment): boolean {
  return Boolean(user && (user.role === 'admin' || comment.authorId === user.id));
}

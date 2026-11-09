import type { Project, Section } from '@/types/api';
import { db, isMember, type DbComment, type DbTask, type DbUser } from './db';
import { forbidden, invalid, isUuid, notFound } from './utils';

/** Project-level permission checks shared by the mock handlers. */

export function canManageProject(project: Project, user: DbUser): boolean {
  return user.role === 'admin' || project.ownerId === user.id;
}

export function assertProjectVisible(project: Project, user: DbUser): void {
  if (user.role !== 'admin' && !isMember(project.id, user.id)) {
    throw forbidden('You are not a member of this project');
  }
}

export function assertCanManage(project: Project, user: DbUser): void {
  if (!canManageProject(project, user)) {
    throw forbidden('Only the project owner or an admin can perform this action');
  }
}

function assertUuid(value: string, field: string): void {
  if (!isUuid(value)) throw invalid(`params.${field}`, 'Invalid uuid');
}

export function loadProject(projectId: string, user: DbUser): Project {
  assertUuid(projectId, 'projectId');
  const project = db.projects.find((candidate) => candidate.id === projectId);
  if (!project) throw notFound('Project not found');
  assertProjectVisible(project, user);
  return project;
}

function projectOf(projectId: string): Project {
  const project = db.projects.find((candidate) => candidate.id === projectId);
  if (!project) throw notFound('Project not found');
  return project;
}

export function loadSection(sectionId: string, user: DbUser): { section: Section; project: Project } {
  assertUuid(sectionId, 'sectionId');
  const section = db.sections.find((candidate) => candidate.id === sectionId);
  if (!section) throw notFound('Section not found');
  const project = projectOf(section.projectId);
  assertProjectVisible(project, user);
  return { section, project };
}

export function loadTask(taskId: string, user: DbUser): { task: DbTask; project: Project } {
  assertUuid(taskId, 'taskId');
  const task = db.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw notFound('Task not found');
  const project = projectOf(task.projectId);
  assertProjectVisible(project, user);
  return { task, project };
}

export function loadComment(
  commentId: string,
  user: DbUser,
): { comment: DbComment; task: DbTask; project: Project } {
  assertUuid(commentId, 'commentId');
  const comment = db.comments.find((candidate) => candidate.id === commentId);
  if (!comment) throw notFound('Comment not found');
  const task = db.tasks.find((candidate) => candidate.id === comment.taskId);
  if (!task) throw notFound('Comment not found');
  const project = projectOf(task.projectId);
  assertProjectVisible(project, user);
  return { comment, task, project };
}

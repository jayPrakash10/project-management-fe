import { z } from 'zod';
import { LIMITS, TASK_PRIORITIES } from './constants';
import { todayUtc } from './dates';

/** Client-side validation that mirrors the API rules. The server's `details` are still shown. */

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(LIMITS.email, `Email must be at most ${LIMITS.email} characters`)
  .email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(LIMITS.userName, `Name must be at most ${LIMITS.userName} characters`),
  email,
  password: z
    .string()
    .min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`)
    .max(LIMITS.passwordMax, `Password must be at most ${LIMITS.passwordMax} characters`),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(LIMITS.projectName, `Name must be at most ${LIMITS.projectName} characters`),
  description: z
    .string()
    .max(LIMITS.description, `Description must be at most ${LIMITS.description} characters`),
});
export type ProjectValues = z.infer<typeof projectSchema>;

export const sectionNameSchema = z
  .string()
  .trim()
  .min(1, 'Section name is required')
  .max(LIMITS.sectionName, `Name must be at most ${LIMITS.sectionName} characters`);

export const taskTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(LIMITS.taskTitle, `Title must be at most ${LIMITS.taskTitle} characters`);

export const descriptionSchema = z
  .string()
  .max(LIMITS.description, `Description must be at most ${LIMITS.description} characters`);

/** Empty string = no due date. Otherwise must not be before today (UTC). */
export const dueDateSchema = z
  .string()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use the format YYYY-MM-DD')
  .refine((value) => value === '' || value >= todayUtc(), 'Due date cannot be in the past');

export const taskCreateSchema = z.object({
  title: taskTitleSchema,
  description: descriptionSchema,
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]),
  sectionId: z.string(),
  dueDate: dueDateSchema,
  assigneeId: z.string(),
});
export type TaskCreateValues = z.infer<typeof taskCreateSchema>;

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write something first')
    .max(LIMITS.comment, `Comments must be at most ${LIMITS.comment} characters`),
});
export type CommentValues = z.infer<typeof commentSchema>;

export const addMemberSchema = z.object({ email });
export type AddMemberValues = z.infer<typeof addMemberSchema>;

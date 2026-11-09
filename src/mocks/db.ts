import type {
  ActivityAction,
  ActivityLog,
  Comment,
  Project,
  ProjectMember,
  Section,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  UserRole,
} from '@/types/api';
import { dueInDays, isoDaysAgo, nowIso, todayUtc } from './dates';

/* ---------- Record types ---------- */

export interface DbUser extends User {
  password: string;
}

export interface DbMembership {
  projectId: string;
  userId: string;
  joinedAt: string;
}

export type DbTask = Omit<Task, 'assigneeName' | 'isOverdue'>;
export type DbComment = Omit<Comment, 'authorName'>;
export type DbActivity = Omit<ActivityLog, 'actorName'>;

/** The whole in-memory database. Resets on every page reload. */
export const db = {
  users: [] as DbUser[],
  projects: [] as Project[],
  memberships: [] as DbMembership[],
  sections: [] as Section[],
  tasks: [] as DbTask[],
  comments: [] as DbComment[],
  activity: [] as DbActivity[],
};

/**
 * Seed records get deterministic UUIDs so ids (and the mock token `mock.<userId>`)
 * survive a page reload; records created at runtime get random ones.
 */
let seeding = false;
let seedCounter = 0;
export const newId = (): string => {
  if (!seeding) return crypto.randomUUID();
  seedCounter += 1;
  return `00000000-0000-4000-8000-${seedCounter.toString(16).padStart(12, "0")}`;
};

/* ---------- Lookups ---------- */

export function findUser(userId: string): DbUser | undefined {
  return db.users.find((user) => user.id === userId);
}

export function findUserByEmail(email: string): DbUser | undefined {
  const normalized = email.trim().toLowerCase();
  return db.users.find((user) => user.email === normalized);
}

export function userName(userId: string): string {
  return findUser(userId)?.name ?? 'Unknown user';
}

export function isMember(projectId: string, userId: string): boolean {
  return db.memberships.some((m) => m.projectId === projectId && m.userId === userId);
}

export function sectionsOf(projectId: string): Section[] {
  return db.sections
    .filter((section) => section.projectId === projectId)
    .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

/* ---------- Serializers (DB record -> API shape) ---------- */

export function toPublicUser(user: DbUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function isTaskOverdue(task: Pick<DbTask, 'dueDate' | 'status'>): boolean {
  return task.dueDate !== null && task.dueDate < todayUtc() && task.status !== 'done';
}

export function toTask(task: DbTask): Task {
  return {
    ...task,
    assigneeName: task.assigneeId ? userName(task.assigneeId) : null,
    isOverdue: isTaskOverdue(task),
  };
}

export function toComment(comment: DbComment): Comment {
  return { ...comment, authorName: userName(comment.authorId) };
}

export function toActivity(log: DbActivity): ActivityLog {
  return { ...log, actorName: userName(log.actorId) };
}

export function toMember(membership: DbMembership): ProjectMember {
  const user = findUser(membership.userId);
  return {
    userId: membership.userId,
    name: user?.name ?? 'Unknown user',
    email: user?.email ?? '',
    role: user?.role ?? 'member',
    joinedAt: membership.joinedAt,
  };
}

/* ---------- Mutations shared by handlers and seed ---------- */

export function logActivity(input: {
  projectId: string;
  actorId: string;
  action: ActivityAction;
  details?: Record<string, unknown>;
  taskId?: string | null;
  createdAt?: string;
}): DbActivity {
  const entry: DbActivity = {
    id: newId(),
    projectId: input.projectId,
    taskId: input.taskId ?? null,
    actorId: input.actorId,
    action: input.action,
    details: input.details ?? {},
    createdAt: input.createdAt ?? nowIso(),
  };
  db.activity.push(entry);
  return entry;
}

export const DEFAULT_SECTION_NAMES = ['To Do', 'In Progress', 'Done'] as const;

export function createDefaultSections(projectId: string, createdAt: string): Section[] {
  const sections = DEFAULT_SECTION_NAMES.map((name, position) => ({
    id: newId(),
    projectId,
    name,
    position,
    createdAt,
  }));
  db.sections.push(...sections);
  return sections;
}

/* ---------- Seed data ---------- */

type SeedUserKey = 'admin' | 'maya' | 'daniel' | 'priya' | 'leo' | 'sara' | 'omar';

const SEED_USERS: Record<SeedUserKey, { name: string; email: string; role: UserRole }> = {
  admin: { name: 'Alex Morgan', email: 'admin@taskflow.dev', role: 'admin' },
  maya: { name: 'Maya Rivera', email: 'maya@taskflow.dev', role: 'manager' },
  daniel: { name: 'Daniel Okafor', email: 'daniel@taskflow.dev', role: 'manager' },
  priya: { name: 'Priya Sharma', email: 'priya@taskflow.dev', role: 'member' },
  leo: { name: 'Leo Martins', email: 'leo@taskflow.dev', role: 'member' },
  sara: { name: 'Sara Lindqvist', email: 'sara@taskflow.dev', role: 'member' },
  omar: { name: 'Omar Haddad', email: 'omar@taskflow.dev', role: 'member' },
};

export const DEMO_PASSWORD = 'Password123!';

interface SeedTask {
  title: string;
  description: string | null;
  /** Index into the default sections: 0 To Do, 1 In Progress, 2 Done. */
  section: 0 | 1 | 2;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: SeedUserKey | null;
  /** Days from today; null = no due date. */
  due: number | null;
  createdBy: SeedUserKey;
  createdDaysAgo: number;
}

interface SeedComment {
  task: number;
  author: SeedUserKey;
  body: string;
  daysAgo: number;
}

interface SeedProject {
  name: string;
  description: string;
  owner: SeedUserKey;
  members: SeedUserKey[];
  createdDaysAgo: number;
  tasks: SeedTask[];
  comments: SeedComment[];
}

const SEED_PROJECTS: SeedProject[] = [
  {
    name: 'Website Redesign',
    description:
      'Refresh the marketing site with a new visual language, faster pages and better accessibility.',
    owner: 'maya',
    members: ['priya', 'leo', 'sara'],
    createdDaysAgo: 15,
    tasks: [
      {
        title: 'Audit current site navigation',
        description: 'List every top-level page, note dead ends and pages with low traffic.',
        section: 2,
        status: 'done',
        priority: 'medium',
        assignee: 'sara',
        due: -6,
        createdBy: 'maya',
        createdDaysAgo: 14,
      },
      {
        title: 'Choose typography and color tokens',
        description: 'Pick the type scale and color palette, and document them as design tokens.',
        section: 2,
        status: 'done',
        priority: 'high',
        assignee: 'priya',
        due: -3,
        createdBy: 'maya',
        createdDaysAgo: 13,
      },
      {
        title: 'Design new homepage hero',
        description: 'Three hero variants with headline, supporting copy and primary call to action.',
        section: 1,
        status: 'in_progress',
        priority: 'high',
        assignee: 'priya',
        due: -2,
        createdBy: 'maya',
        createdDaysAgo: 12,
      },
      {
        title: 'Build responsive header component',
        description: 'Header with collapsible navigation below 768px and keyboard-accessible menus.',
        section: 1,
        status: 'in_review',
        priority: 'high',
        assignee: 'leo',
        due: 0,
        createdBy: 'maya',
        createdDaysAgo: 11,
      },
      {
        title: 'Accessibility review of forms',
        description: 'Check labels, error messages and focus order on the contact and sign-up forms.',
        section: 0,
        status: 'todo',
        priority: 'urgent',
        assignee: 'priya',
        due: 4,
        createdBy: 'maya',
        createdDaysAgo: 9,
      },
      {
        title: 'Write copy for About page',
        description: null,
        section: 0,
        status: 'todo',
        priority: 'medium',
        assignee: 'sara',
        due: 3,
        createdBy: 'sara',
        createdDaysAgo: 8,
      },
      {
        title: 'Set up analytics events',
        description: 'Track sign-up clicks, pricing page views and newsletter subscriptions.',
        section: 0,
        status: 'todo',
        priority: 'low',
        assignee: null,
        due: null,
        createdBy: 'leo',
        createdDaysAgo: 6,
      },
      {
        title: 'Migrate blog to new CMS',
        description: 'Move existing posts and set up redirects for old URLs.',
        section: 0,
        status: 'todo',
        priority: 'medium',
        assignee: 'leo',
        due: 14,
        createdBy: 'maya',
        createdDaysAgo: 4,
      },
    ],
    comments: [
      { task: 2, author: 'priya', body: 'First draft is in Figma, feedback welcome.', daysAgo: 5 },
      {
        task: 2,
        author: 'maya',
        body: 'Love variant B. Can we try a shorter headline?',
        daysAgo: 4,
      },
      {
        task: 3,
        author: 'leo',
        body: 'Ready for review. The mobile menu traps focus while open.',
        daysAgo: 1,
      },
      { task: 0, author: 'sara', body: 'Audit spreadsheet is linked in the project brief.', daysAgo: 9 },
    ],
  },
  {
    name: 'Q1 Marketing Campaign',
    description: 'Plan and launch the Q1 campaign across email, social and paid channels.',
    owner: 'maya',
    members: ['sara', 'omar'],
    createdDaysAgo: 12,
    tasks: [
      {
        title: 'Define campaign goals and KPIs',
        description: 'Agree on target sign-ups, conversion rate and budget ceiling.',
        section: 2,
        status: 'done',
        priority: 'high',
        assignee: 'maya',
        due: -4,
        createdBy: 'maya',
        createdDaysAgo: 11,
      },
      {
        title: 'Set campaign budget per channel',
        description: null,
        section: 1,
        status: 'in_review',
        priority: 'high',
        assignee: 'maya',
        due: 0,
        createdBy: 'maya',
        createdDaysAgo: 10,
      },
      {
        title: 'Draft launch email sequence',
        description: 'Three emails: announcement, feature spotlight and last-chance reminder.',
        section: 1,
        status: 'in_progress',
        priority: 'high',
        assignee: 'sara',
        due: 1,
        createdBy: 'maya',
        createdDaysAgo: 9,
      },
      {
        title: 'Brief design team on ad creatives',
        description: 'Share sizes, copy and brand guidelines for the paid social ads.',
        section: 0,
        status: 'todo',
        priority: 'urgent',
        assignee: 'sara',
        due: -1,
        createdBy: 'maya',
        createdDaysAgo: 8,
      },
      {
        title: 'Plan social media calendar',
        description: null,
        section: 0,
        status: 'todo',
        priority: 'medium',
        assignee: 'omar',
        due: 6,
        createdBy: 'omar',
        createdDaysAgo: 6,
      },
      {
        title: 'Collect customer testimonials',
        description: 'Reach out to five customers for short quotes we can use in the campaign.',
        section: 0,
        status: 'todo',
        priority: 'low',
        assignee: null,
        due: null,
        createdBy: 'sara',
        createdDaysAgo: 3,
      },
    ],
    comments: [
      { task: 2, author: 'sara', body: 'Email 1 is drafted. Working on the spotlight next.', daysAgo: 2 },
      { task: 3, author: 'omar', body: 'Design asked for the final copy before they start.', daysAgo: 1 },
    ],
  },
  {
    name: 'Mobile App Launch',
    description: 'Ship version 1.0 of the mobile app to the App Store and Google Play.',
    owner: 'daniel',
    members: ['leo', 'omar'],
    createdDaysAgo: 14,
    tasks: [
      {
        title: 'Set up crash reporting',
        description: 'Integrate crash reporting for both platforms and add release tags.',
        section: 2,
        status: 'done',
        priority: 'medium',
        assignee: 'omar',
        due: -5,
        createdBy: 'daniel',
        createdDaysAgo: 13,
      },
      {
        title: 'Fix crash on Android 12 login',
        description: 'Crash when the keyboard opens on the login screen. Reproducible on Pixel 6.',
        section: 1,
        status: 'in_progress',
        priority: 'urgent',
        assignee: 'leo',
        due: -3,
        createdBy: 'daniel',
        createdDaysAgo: 10,
      },
      {
        title: 'Finalize app store screenshots',
        description: null,
        section: 1,
        status: 'in_progress',
        priority: 'high',
        assignee: 'leo',
        due: 2,
        createdBy: 'daniel',
        createdDaysAgo: 9,
      },
      {
        title: 'Localize onboarding screens',
        description: 'Spanish, German and Portuguese translations for the onboarding flow.',
        section: 1,
        status: 'in_review',
        priority: 'medium',
        assignee: 'omar',
        due: null,
        createdBy: 'omar',
        createdDaysAgo: 8,
      },
      {
        title: 'Write release notes for v1.0',
        description: null,
        section: 0,
        status: 'todo',
        priority: 'medium',
        assignee: 'omar',
        due: 4,
        createdBy: 'daniel',
        createdDaysAgo: 6,
      },
      {
        title: 'Submit build for App Store review',
        description: 'Upload the release build and complete the review questionnaire.',
        section: 0,
        status: 'todo',
        priority: 'urgent',
        assignee: null,
        due: 8,
        createdBy: 'daniel',
        createdDaysAgo: 5,
      },
      {
        title: 'Prepare beta tester invite list',
        description: null,
        section: 0,
        status: 'todo',
        priority: 'low',
        assignee: 'daniel',
        due: 10,
        createdBy: 'daniel',
        createdDaysAgo: 2,
      },
    ],
    comments: [
      { task: 1, author: 'leo', body: 'Found the cause: an outdated keyboard library. Patch incoming.', daysAgo: 1 },
      { task: 1, author: 'daniel', body: 'Thanks! This blocks the store submission.', daysAgo: 1 },
      { task: 3, author: 'omar', body: 'German strings are back from the translator.', daysAgo: 2 },
    ],
  },
];

function seed(): void {
  const userIds = {} as Record<SeedUserKey, string>;

  (Object.keys(SEED_USERS) as SeedUserKey[]).forEach((key, index) => {
    const info = SEED_USERS[key];
    const createdAt = isoDaysAgo(30 - index);
    const id = newId();
    userIds[key] = id;
    db.users.push({ id, ...info, password: DEMO_PASSWORD, createdAt, updatedAt: createdAt });
  });

  for (const project of SEED_PROJECTS) {
    const projectId = newId();
    const ownerId = userIds[project.owner];
    const projectCreatedAt = isoDaysAgo(project.createdDaysAgo, 2);

    db.projects.push({
      id: projectId,
      name: project.name,
      description: project.description,
      ownerId,
      createdAt: projectCreatedAt,
      updatedAt: projectCreatedAt,
    });
    db.memberships.push({ projectId, userId: ownerId, joinedAt: projectCreatedAt });
    const sections = createDefaultSections(projectId, projectCreatedAt);
    logActivity({
      projectId,
      actorId: ownerId,
      action: 'project.created',
      details: { name: project.name },
      createdAt: projectCreatedAt,
    });

    project.members.forEach((memberKey, index) => {
      const joinedAt = isoDaysAgo(project.createdDaysAgo, 1 - index * 0.1);
      const userId = userIds[memberKey];
      db.memberships.push({ projectId, userId, joinedAt });
      logActivity({
        projectId,
        actorId: ownerId,
        action: 'member.added',
        details: { userId, name: SEED_USERS[memberKey].name },
        createdAt: joinedAt,
      });
    });

    const taskIds = project.tasks.map((seedTask) => {
      const taskId = newId();
      const createdAt = isoDaysAgo(seedTask.createdDaysAgo, 3);
      const creatorId = userIds[seedTask.createdBy];
      const assigneeId = seedTask.assignee ? userIds[seedTask.assignee] : null;
      const changedAt = isoDaysAgo(Math.max(seedTask.createdDaysAgo - 2, 0), 5);
      const completedAt = seedTask.status === 'done' ? changedAt : null;

      db.tasks.push({
        id: taskId,
        projectId,
        sectionId: sections[seedTask.section].id,
        title: seedTask.title,
        description: seedTask.description,
        status: seedTask.status,
        priority: seedTask.priority,
        assigneeId,
        createdBy: creatorId,
        dueDate: seedTask.due === null ? null : dueInDays(seedTask.due),
        completedAt,
        createdAt,
        updatedAt: seedTask.status === 'todo' ? createdAt : changedAt,
      });

      logActivity({
        projectId,
        taskId,
        actorId: creatorId,
        action: 'task.created',
        details: { title: seedTask.title },
        createdAt,
      });
      if (assigneeId) {
        logActivity({
          projectId,
          taskId,
          actorId: ownerId,
          action: 'task.assigned',
          details: { assigneeId, previousAssigneeId: null },
          createdAt: isoDaysAgo(seedTask.createdDaysAgo, 2.5),
        });
      }
      if (seedTask.status !== 'todo') {
        logActivity({
          projectId,
          taskId,
          actorId: assigneeId ?? ownerId,
          action: 'task.status_changed',
          details: { from: 'todo', to: seedTask.status },
          createdAt: changedAt,
        });
      }
      return taskId;
    });

    for (const seedComment of project.comments) {
      const createdAt = isoDaysAgo(seedComment.daysAgo, 4);
      const taskId = taskIds[seedComment.task];
      const authorId = userIds[seedComment.author];
      db.comments.push({
        id: newId(),
        taskId,
        authorId,
        body: seedComment.body,
        createdAt,
        updatedAt: createdAt,
      });
      logActivity({
        projectId,
        taskId,
        actorId: authorId,
        action: 'comment.added',
        details: {},
        createdAt,
      });
    }
  }
}

seeding = true;
seed();
seeding = false;

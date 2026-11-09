import { http, type HttpHandler } from 'msw';
import type { Section } from '@/types/api';
import { assertCanManage, loadProject, loadSection } from '../access';
import { db, newId, sectionsOf } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  conflict,
  created,
  defined,
  noContent,
  ok,
  readBody,
  requireUser,
  route,
} from '../utils';

const DUPLICATE_NAME = 'A section with this name already exists in this project';

function nameTaken(projectId: string, name: string, exceptId?: string): boolean {
  const normalized = name.toLowerCase();
  return sectionsOf(projectId).some(
    (section) => section.id !== exceptId && section.name.toLowerCase() === normalized,
  );
}

export function sectionHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/projects/:projectId/sections`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        return ok(sectionsOf(project.id));
      }),
    ),

    http.post(
      `${base}/projects/:projectId/sections`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        assertCanManage(project, user);

        const v = new Validator(await readBody(request), 'body');
        const nameInput = v.string('name', { required: true, min: 1, max: 100, trim: true });
        const position = v.int('position', { min: 0 });
        v.assert();
        const name = defined(nameInput);

        if (nameTaken(project.id, name)) throw conflict(DUPLICATE_NAME);

        const existing = sectionsOf(project.id);
        const section: Section = {
          id: newId(),
          projectId: project.id,
          name,
          position:
            position ??
            (existing.length === 0 ? 0 : Math.max(...existing.map((s) => s.position)) + 1),
          createdAt: nowIso(),
        };
        db.sections.push(section);
        return created(section);
      }),
    ),

    http.patch(
      `${base}/sections/:sectionId`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const { section, project } = loadSection(params.sectionId ?? '', user);
        assertCanManage(project, user);

        const v = new Validator(await readBody(request), 'body');
        v.requireAny(['name', 'position']);
        const name = v.string('name', { min: 1, max: 100, trim: true });
        const position = v.int('position', { min: 0 });
        v.assert();

        if (name !== undefined) {
          if (nameTaken(project.id, name, section.id)) throw conflict(DUPLICATE_NAME);
          section.name = name;
        }
        if (position !== undefined) section.position = position;
        return ok(section);
      }),
    ),

    http.delete(
      `${base}/sections/:sectionId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const { section, project } = loadSection(params.sectionId ?? '', user);
        assertCanManage(project, user);

        const timestamp = nowIso();
        for (const task of db.tasks) {
          if (task.sectionId === section.id) {
            task.sectionId = null;
            task.updatedAt = timestamp;
          }
        }
        db.sections = db.sections.filter((candidate) => candidate.id !== section.id);
        return noContent();
      }),
    ),
  ];
}

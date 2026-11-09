import type { Section, SectionCreateInput, SectionUpdateInput } from '@/types/api';
import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export const sectionsApi = {
  list: (projectId: string) => apiGet<Section[]>(`/projects/${projectId}/sections`),
  create: (projectId: string, input: SectionCreateInput) =>
    apiPost<Section>(`/projects/${projectId}/sections`, input),
  update: (sectionId: string, input: SectionUpdateInput) =>
    apiPatch<Section>(`/sections/${sectionId}`, input),
  remove: (sectionId: string) => apiDelete(`/sections/${sectionId}`),
};

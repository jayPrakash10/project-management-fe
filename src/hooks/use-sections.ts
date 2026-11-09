import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { sectionsApi } from '@/api/sections';
import { sortSections } from '@/lib/tasks';
import type { Section } from '@/types/api';

export function useSections(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project.sections(projectId ?? ''),
    queryFn: () => sectionsApi.list(projectId ?? ''),
    enabled: Boolean(projectId),
    select: sortSections,
  });
}

export function useCreateSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => sectionsApi.create(projectId, { name }),
    onSuccess: (section) => {
      queryClient.setQueryData<Section[]>(queryKeys.project.sections(projectId), (sections) =>
        sections ? [...sections, section] : sections,
      );
    },
  });
}

export function useRenameSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, name }: { sectionId: string; name: string }) =>
      sectionsApi.update(sectionId, { name }),
    onSuccess: (section) => {
      queryClient.setQueryData<Section[]>(queryKeys.project.sections(projectId), (sections) =>
        sections?.map((item) => (item.id === section.id ? section : item)),
      );
    },
  });
}

/**
 * Reorder columns. The API doesn't shift other sections, so every section whose
 * position changed gets its own PATCH with its new index (0..n-1).
 */
export interface ReorderSectionsInput {
  /** Section ids in their new left-to-right order. */
  orderedIds: string[];
  /**
   * The sections as they were before the move. The PATCH list must be computed from
   * these: onMutate runs before mutationFn and has already written the new
   * positions into the cache, so diffing against the cache would find no changes.
   */
  before: Section[];
}

export function useReorderSections(projectId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.project.sections(projectId);

  return useMutation({
    mutationFn: async ({ orderedIds, before }: ReorderSectionsInput) => {
      const positions = new Map(before.map((section) => [section.id, section.position]));
      for (const [index, sectionId] of orderedIds.entries()) {
        if (positions.get(sectionId) !== index) {
          await sectionsApi.update(sectionId, { position: index });
        }
      }
    },
    onMutate: async ({ orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Section[]>(key);
      // Optimistic: apply the new order right away (positions are updated after the requests).
      queryClient.setQueryData<Section[]>(key, (sections) => {
        if (!sections) return sections;
        const byId = new Map(sections.map((section) => [section.id, section]));
        return orderedIds
          .map((id, index) => {
            const section = byId.get(id);
            return section ? { ...section, position: index } : null;
          })
          .filter((section): section is Section => section !== null);
      });
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useDeleteSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) => sectionsApi.remove(sectionId),
    onSuccess: (_result, sectionId) => {
      queryClient.setQueryData<Section[]>(queryKeys.project.sections(projectId), (sections) =>
        sections?.filter((section) => section.id !== sectionId),
      );
      // Tasks in the section are kept with sectionId = null: refetch them.
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      void queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

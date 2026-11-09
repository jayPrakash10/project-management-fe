import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { queryKeys } from '@/api/query-keys';
import type { Project, ProjectInput, ProjectListParams } from '@/types/api';

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Every visible project (all pages), for the sidebar and name lookups. */
export function useProjectLookup() {
  return useQuery({
    queryKey: queryKeys.projects.lookup,
    queryFn: projectsApi.listAll,
    staleTime: 60_000,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project.detail(projectId ?? ''),
    queryFn: () => projectsApi.get(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsApi.create(input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.project.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProjectInput>) => projectsApi.update(projectId, input),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(queryKeys.project.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: (_result, projectId) => {
      queryClient.removeQueries({ queryKey: queryKeys.project.all(projectId) });
      queryClient.removeQueries({ queryKey: queryKeys.tasks.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.mine });
    },
  });
}

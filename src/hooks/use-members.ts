import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { membersApi } from '@/api/members';
import { queryKeys } from '@/api/query-keys';
import type { ProjectMember } from '@/types/api';

export function useMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project.members(projectId ?? ''),
    queryFn: () => membersApi.list(projectId ?? ''),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}

/** userId → name, for resolving ids in the activity log and "created by". */
export function useMemberNames(members: ProjectMember[] | undefined) {
  return useMemo(() => {
    const names = new Map((members ?? []).map((member) => [member.userId, member.name]));
    return (userId: string) => names.get(userId) ?? null;
  }, [members]);
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => membersApi.add(projectId, email),
    onSuccess: (member) => {
      queryClient.setQueryData<ProjectMember[]>(queryKeys.project.members(projectId), (members) =>
        members ? [...members, member].sort((a, b) => a.name.localeCompare(b.name)) : members,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.project.activity(projectId) });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membersApi.remove(projectId, userId),
    onSuccess: (_result, userId) => {
      queryClient.setQueryData<ProjectMember[]>(queryKeys.project.members(projectId), (members) =>
        members?.filter((member) => member.userId !== userId),
      );
      // The server unassigns the removed member's unfinished tasks: refetch tasks.
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      void queryClient.invalidateQueries({ queryKey: ['task'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.project.activity(projectId) });
    },
  });
}

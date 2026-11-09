import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { reportsApi } from '@/api/reports';

export function useProjectSummary(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project.summary(projectId),
    queryFn: () => reportsApi.summary(projectId),
  });
}

/** Activity log, newest first, 20 per page with "Load more". */
export function useProjectActivity(projectId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.project.activity(projectId),
    queryFn: ({ pageParam }) => reportsApi.activity(projectId, { page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
  });
}

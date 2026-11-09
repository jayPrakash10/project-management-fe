import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { queryKeys } from '@/api/query-keys';
import type { Comment, Paginated } from '@/types/api';

const PAGE_SIZE = 50;

/** Comments are returned oldest first; "load more" fetches newer ones. */
export function useComments(taskId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments(taskId),
    queryFn: ({ pageParam }) => commentsApi.list(taskId, { page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
  });
}

type CommentPages = InfiniteData<Paginated<Comment>, number>;

export function useAddComment(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsApi.create(taskId, body),
    onSuccess: (comment) => {
      queryClient.setQueryData<CommentPages>(queryKeys.comments(taskId), (data) => {
        if (!data) return data;
        const pages = [...data.pages];
        const last = pages[pages.length - 1];
        // Only append when the newest page is loaded; otherwise the refetch below picks it up.
        if (last.meta.page >= last.meta.totalPages) {
          pages[pages.length - 1] = {
            data: [...last.data, comment],
            meta: { ...last.meta, total: last.meta.total + 1 },
          };
        }
        return { ...data, pages };
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.project.activity(projectId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(commentId),
    onSuccess: (_result, commentId) => {
      queryClient.setQueryData<CommentPages>(queryKeys.comments(taskId), (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                data: page.data.filter((comment) => comment.id !== commentId),
                meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
              })),
            }
          : data,
      );
    },
  });
}

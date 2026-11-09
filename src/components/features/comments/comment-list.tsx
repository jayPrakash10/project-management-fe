import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useComments, useDeleteComment } from '@/hooks/use-comments';
import { useToast } from '@/hooks/use-toast';
import { canDeleteComment } from '@/lib/permissions';
import type { Comment } from '@/types/api';
import { CommentItem } from './comment-item';

/** Oldest first, matching the API. "Show newer comments" loads the next page. */
export function CommentList({ taskId }: { taskId: string }) {
  const { user } = useAuth();
  const commentsQuery = useComments(taskId);
  const deleteComment = useDeleteComment(taskId);
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null);

  if (commentsQuery.isPending) {
    return (
      <LoadingRegion label="Loading comments" className="space-y-4">
        {[0, 1].map((index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </LoadingRegion>
    );
  }

  if (commentsQuery.isError) {
    return <ErrorState compact error={commentsQuery.error} onRetry={() => void commentsQuery.refetch()} />;
  }

  const comments = commentsQuery.data.pages.flatMap((page) => page.data);

  if (comments.length === 0) {
    return (
      <p className="flex items-center gap-2 text-base text-fg-muted">
        <MessageSquare aria-hidden className="size-4" />
        No comments yet. Start the conversation below.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={canDeleteComment(user, comment)}
            onDelete={() => setPendingDelete(comment)}
          />
        ))}
      </ul>

      {commentsQuery.hasNextPage && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          loading={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
        >
          Show newer comments
        </Button>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this comment?"
        description="The comment will be permanently removed."
        confirmLabel="Delete comment"
        loading={deleteComment.isPending}
        error={deleteComment.isError ? getErrorMessage(deleteComment.error) : null}
        onCancel={() => {
          setPendingDelete(null);
          deleteComment.reset();
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteComment.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(null);
              toast.success('Comment deleted');
            },
          });
        }}
      />
    </>
  );
}

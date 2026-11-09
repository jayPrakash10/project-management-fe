import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAddComment } from '@/hooks/use-comments';
import { LIMITS } from '@/lib/constants';
import { applyApiErrors } from '@/lib/form-errors';
import { commentSchema, type CommentValues } from '@/lib/schemas';

/** Pinned at the bottom of the task pane. Ctrl/Cmd + Enter sends. */
export function CommentComposer({ taskId, projectId }: { taskId: string; projectId: string }) {
  const user = useCurrentUser();
  const addComment = useAddComment(taskId, projectId);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { body: '' } });

  const length = watch('body').length;

  const onSubmit = handleSubmit((values) => {
    addComment.mutate(values.body, {
      onSuccess: () => reset(),
      onError: (error) => {
        const message = applyApiErrors(error, setError, ['body']);
        if (message) setError('body', { type: 'server', message });
      },
    });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex items-start gap-3">
      <Avatar name={user.name} size="md" className="mt-1 hidden sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <label htmlFor="comment-body" className="sr-only">
          Add a comment
        </label>
        <Textarea
          id="comment-body"
          rows={2}
          maxLength={LIMITS.comment}
          placeholder="Add a comment…"
          aria-invalid={errors.body ? true : undefined}
          aria-describedby="comment-help"
          {...register('body')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void onSubmit();
            }
          }}
          className="resize-none"
        />
        <div id="comment-help" className="mt-1 flex items-center justify-between gap-2 text-sm">
          {errors.body ? (
            <span className="text-danger-soft-fg">{errors.body.message}</span>
          ) : (
            <span className="text-fg-subtle">Ctrl + Enter to send</span>
          )}
          {length > LIMITS.comment * 0.8 && (
            <span className="text-fg-subtle tabular-nums">
              {length} / {LIMITS.comment}
            </span>
          )}
        </div>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={addComment.isPending}
        aria-label="Send comment"
        className="mt-1"
        leftIcon={<SendHorizontal aria-hidden className="size-4" />}
      >
        <span className="hidden sm:inline">Send</span>
      </Button>
    </form>
  );
}

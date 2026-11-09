import { Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { formatDateTime, formatRelative } from '@/lib/dates';
import type { Comment } from '@/types/api';

export function CommentItem({ comment, canDelete, onDelete }: { comment: Comment; canDelete: boolean; onDelete: () => void }) {
  return (
    <li className="group flex gap-3">
      <Avatar name={comment.authorName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-fg">{comment.authorName}</span>
          <time dateTime={comment.createdAt} title={formatDateTime(comment.createdAt)} className="text-sm text-fg-subtle">
            {formatRelative(comment.createdAt)}
          </time>
          {canDelete && (
            <IconButton
              label="Delete comment"
              icon={<Trash2 className="size-4" />}
              size="sm"
              variant="danger-ghost"
              onClick={onDelete}
              className="ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            />
          )}
        </div>
        <p className="mt-0.5 text-base break-words whitespace-pre-wrap text-fg">{comment.body}</p>
      </div>
    </li>
  );
}

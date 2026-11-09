import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUserRole } from '@/hooks/use-users';
import { ROLE_LABELS, USER_ROLES, isUserRole } from '@/lib/constants';
import type { User } from '@/types/api';

const roleOptions = USER_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }));

/** Per-row role dropdown. Disabled on the admin's own row (the API returns 409). */
export function RoleSelect({ user, isSelf }: { user: User; isSelf: boolean }) {
  const updateRole = useUpdateUserRole();
  const toast = useToast();
  const hintId = `role-hint-${user.id}`;

  return (
    <div>
      <Select
        size="sm"
        aria-label={`Role for ${user.name}`}
        aria-describedby={isSelf ? hintId : undefined}
        options={roleOptions}
        value={user.role}
        disabled={isSelf || updateRole.isPending}
        onChange={(event) => {
          const role = event.target.value;
          if (!isUserRole(role) || role === user.role) return;
          updateRole.mutate(
            { userId: user.id, role },
            {
              onSuccess: (updated) =>
                toast.success(`${updated.name}’s role is now ${ROLE_LABELS[updated.role]}`, {
                  description: 'The change applies the next time they log in.',
                }),
              onError: (error) => toast.error(error),
            },
          );
        }}
        wrapperClassName="w-36"
      />
      {isSelf && (
        <p id={hintId} className="mt-1 text-xs text-fg-subtle">
          You can’t change your own role
        </p>
      )}
    </div>
  );
}

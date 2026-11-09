import { UsersRound } from 'lucide-react';
import { RoleSelect } from '@/components/features/admin/role-select';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormAlert } from '@/components/ui/form-alert';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { useCurrentUser } from '@/hooks/use-auth';
import { parsePage, useUrlParams } from '@/hooks/use-url-params';
import { useUsers } from '@/hooks/use-users';
import { DEFAULT_PAGE_SIZE, ROLE_LABELS, USER_ROLES, isUserRole } from '@/lib/constants';
import { formatDate } from '@/lib/dates';

const roleFilterOptions = USER_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }));

/** Admin only: every user, with role changes. */
export function AdminUsersPage() {
  const me = useCurrentUser();
  const { get, set, setFilters } = useUrlParams();
  const search = get('q') ?? '';
  const rawRole = get('role');
  const role = isUserRole(rawRole) ? rawRole : undefined;
  const page = parsePage(get('page'));
  const usersQuery = useUsers({ page, limit: DEFAULT_PAGE_SIZE, search: search || undefined, role });

  return (
    <PageContainer>
      <PageHeader title="Users" description="Everyone with a TaskFlow account." />

      <FormAlert tone="info" className="mb-5">
        Role changes apply the next time the user logs in.
      </FormAlert>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => setFilters({ q: value })}
          label="Search users by name or email"
          placeholder="Search name or email…"
          className="sm:w-72"
          shortcutTarget
        />
        <Select
          size="sm"
          aria-label="Filter by role"
          placeholderOption="All roles"
          options={roleFilterOptions}
          value={role ?? ''}
          onChange={(event) => setFilters({ role: event.target.value })}
          wrapperClassName="sm:w-40"
        />
      </div>

      {usersQuery.isPending ? (
        <LoadingRegion label="Loading users" className="space-y-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </LoadingRegion>
      ) : usersQuery.isError ? (
        <ErrorState error={usersQuery.error} onRetry={() => void usersQuery.refetch()} />
      ) : usersQuery.data.data.length === 0 ? (
        <EmptyState icon={<UsersRound />} title="No users found" description="Try a different name, email or role." />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table aria-busy={usersQuery.isFetching}>
              <caption className="sr-only">Users</caption>
              <TableHead>
                <tr>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Joined</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {usersQuery.data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="flex items-center gap-3 font-medium text-fg">
                        <Avatar name={user.name} size="md" />
                        {user.name}
                        {user.id === me.id && <span className="text-sm font-normal text-fg-subtle">(you)</span>}
                      </span>
                    </TableCell>
                    <TableCell className="text-fg-muted">{user.email}</TableCell>
                    <TableCell>
                      <RoleSelect user={user} isSelf={user.id === me.id} />
                    </TableCell>
                    <TableCell className="text-fg-muted">{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-2 md:hidden">
            {usersQuery.data.data.map((user) => (
              <li key={user.id} className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">
                      {user.name} {user.id === me.id && <span className="text-sm font-normal text-fg-subtle">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-fg-muted">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <RoleSelect user={user} isSelf={user.id === me.id} />
                  <span className="text-sm text-fg-subtle">Joined {formatDate(user.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            className="mt-5"
            page={page}
            totalPages={usersQuery.data.meta.totalPages}
            onPageChange={(next) => set({ page: next }, { replace: false })}
          />
        </>
      )}
    </PageContainer>
  );
}

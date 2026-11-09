import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { usersApi } from '@/api/users';
import type { Paginated, User, UserListParams, UserRole } from '@/types/api';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => usersApi.updateRole(userId, role),
    onSuccess: (user) => {
      queryClient.setQueriesData<Paginated<User>>({ queryKey: ['users'] }, (page) =>
        page ? { ...page, data: page.data.map((item) => (item.id === user.id ? user : item)) } : page,
      );
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

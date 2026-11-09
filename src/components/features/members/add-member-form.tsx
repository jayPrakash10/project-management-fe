import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAddMember } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { applyApiErrors } from '@/lib/form-errors';
import { addMemberSchema, type AddMemberValues } from '@/lib/schemas';

/** Plain email input: non-admins can't search users, so this works for everyone. */
export function AddMemberForm({ projectId }: { projectId: string }) {
  const addMember = useAddMember(projectId);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddMemberValues>({ resolver: zodResolver(addMemberSchema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit((values) => {
    addMember.mutate(values.email, {
      onSuccess: (member) => {
        toast.success(`${member.name} added to the project`);
        reset();
      },
      onError: (error) => {
        // 404 "No user found with this email" and 409 "already a member" are shown inline.
        const message = applyApiErrors(error, setError, ['email']);
        if (message) setError('email', { type: 'server', message });
      },
    });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Field
        label="Add a member by email"
        error={errors.email?.message}
        hint="They need an existing TaskFlow account."
        className="flex-1"
      >
        {(control) => <Input {...control} {...register('email')} type="email" autoComplete="off" placeholder="name@company.com" />}
      </Field>
      <Button
        type="submit"
        variant="primary"
        loading={addMember.isPending}
        leftIcon={<UserPlus aria-hidden className="size-4" />}
        className="sm:mt-6.5"
      >
        Add member
      </Button>
    </form>
  );
}

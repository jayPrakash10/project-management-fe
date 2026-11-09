import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { isApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { LIMITS } from '@/lib/constants';
import { applyApiErrors } from '@/lib/form-errors';
import { projectSchema, type ProjectValues } from '@/lib/schemas';
import type { Project } from '@/types/api';

export interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this project instead of creating one. */
  project?: Project;
}

const FIELDS = ['name', 'description'] as const;

export function ProjectFormModal(props: ProjectFormModalProps) {
  return props.open ? <ProjectForm {...props} /> : null;
}

function ProjectForm({ open, onClose, project }: ProjectFormModalProps) {
  const editing = Boolean(project);
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(project?.id ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const pending = createProject.isPending || updateProject.isPending;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: project?.name ?? '', description: project?.description ?? '' },
  });
  const descriptionLength = watch('description').length;

  function handleError(error: unknown) {
    // A freshly promoted user still has the old role in their token.
    if (!editing && isApiError(error, 403)) {
      setFormError(null);
      onClose();
      toast.error('Your new role takes effect after you log in again.', {
        action: { label: 'Log out', onClick: logout },
      });
      return;
    }
    setFormError(applyApiErrors(error, setError, FIELDS));
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const description = values.description.trim() ? values.description : null;

    if (project) {
      updateProject.mutate(
        { name: values.name, description },
        {
          onSuccess: () => {
            toast.success('Project updated');
            onClose();
          },
          onError: handleError,
        },
      );
      return;
    }

    createProject.mutate(
      description ? { name: values.name, description } : { name: values.name },
      {
        onSuccess: (created) => {
          toast.success('Project created', { description: 'To Do, In Progress and Done sections are ready.' });
          onClose();
          navigate(`/projects/${created.id}/board`);
        },
        onError: handleError,
      },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit project' : 'New project'}
      description={editing ? undefined : 'You’ll be the owner. Add teammates from the Members tab.'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="project-form" loading={pending}>
            {editing ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" noValidate onSubmit={onSubmit} className="space-y-4">
        {formError && <FormAlert>{formError}</FormAlert>}
        <Field label="Name" required error={errors.name?.message}>
          {(control) => <Input {...control} {...register('name')} autoFocus maxLength={LIMITS.projectName} />}
        </Field>
        <Field
          label="Description"
          error={errors.description?.message}
          hint={descriptionLength > LIMITS.description * 0.9 ? `${descriptionLength} / ${LIMITS.description}` : 'Optional'}
        >
          {(control) => <Textarea {...control} {...register('description')} rows={4} maxLength={LIMITS.description} />}
        </Field>
      </form>
    </Modal>
  );
}

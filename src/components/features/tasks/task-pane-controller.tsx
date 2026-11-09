import { Sheet } from '@/components/ui/sheet';
import { useTaskPane } from '@/hooks/use-task-pane';
import { TaskDetailPane } from './task-detail-pane';

/** Renders the task pane whenever the URL has ?task=<id>, on any page. */
export function TaskPaneController() {
  const { openTaskId, closeTask } = useTaskPane();

  return (
    <Sheet open={Boolean(openTaskId)} onClose={closeTask} label="Task details" className="md:max-w-xl">
      {openTaskId && <TaskDetailPane key={openTaskId} taskId={openTaskId} onClose={closeTask} />}
    </Sheet>
  );
}

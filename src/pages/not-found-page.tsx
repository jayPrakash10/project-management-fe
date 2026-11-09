import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { PageContainer } from '@/components/layout/page-container';
import { buttonStyles } from '@/components/ui/button-styles';
import { EmptyState } from '@/components/ui/empty-state';

export function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={<SearchX />}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or you don’t have access to it."
        action={
          <Link to="/my-tasks" className={buttonStyles({ variant: 'primary' })}>
            Go to My Tasks
          </Link>
        }
      />
    </PageContainer>
  );
}

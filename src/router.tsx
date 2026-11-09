import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { RootLayout } from '@/components/layout/root-layout';
import { HomeRoute, ProtectedRoute, PublicOnlyRoute, RequireAdmin } from '@/components/layout/route-guards';
import { AdminUsersPage } from '@/pages/admin-users-page';
import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/login-page';
import { MyTasksPage } from '@/pages/my-tasks-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ProjectBoardPage } from '@/pages/project-board-page';
import { ProjectLayout } from '@/pages/project-layout';
import { ProjectListPage } from '@/pages/project-list-page';
import { ProjectMembersPage } from '@/pages/project-members-page';
import { ProjectOverviewPage } from '@/pages/project-overview-page';
import { ProjectsPage } from '@/pages/projects-page';
import { RegisterPage } from '@/pages/register-page';
import { RouteErrorPage } from '@/pages/route-error-page';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <HomeRoute landing={<LandingPage />} /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'my-tasks', element: <MyTasksPage /> },
              { path: 'projects', element: <ProjectsPage /> },
              {
                path: 'projects/:projectId',
                element: <ProjectLayout />,
                children: [
                  { index: true, element: <Navigate to="board" replace /> },
                  { path: 'overview', element: <ProjectOverviewPage /> },
                  { path: 'list', element: <ProjectListPage /> },
                  { path: 'board', element: <ProjectBoardPage /> },
                  { path: 'members', element: <ProjectMembersPage /> },
                ],
              },
              {
                element: <RequireAdmin />,
                children: [{ path: 'admin/users', element: <AdminUsersPage /> }],
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

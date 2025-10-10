export const mockRuns = [
  {
    id: 'run-abc123xyz',
    message:
      'Merged feature branch into main\n\n* feat: add new user management module\n* fix: resolve merge conflicts\n* refactor: cleanup unused imports\n\nApproved-by: Alice Johnson\nApproved-by: Bob Smith\n',
    status: 'applied',
    createdAt: '2025-02-28T09:28:40.755Z',
    confirmedBy: {
      name: 'janedoe',
      avatar: 'https://www.gravatar.com/avatar/example?s=100&d=mm',
    },
    plan: {
      logs: 'https://example.com/logs/run-abc123xyz',
    },
    workspace: {
      name: 'project-user-management',
    },
  },
  {
    id: 'run-def456uvw',
    message: 'Added new test environments for CI validation\n',
    status: 'planned_and_finished',
    createdAt: '2025-02-28T06:55:29.515Z',
    confirmedBy: null,
    plan: {
      logs: 'https://example.com/logs/run-def456uvw',
    },
    workspace: {
      name: 'project-ci-config',
    },
  },
  {
    id: 'run-ghi789rst',
    message: 'Updated Terraform configuration for production rollout\n',
    status: 'planned_and_finished',
    createdAt: '2025-02-28T05:53:05.664Z',
    confirmedBy: null,
    plan: {
      logs: 'https://example.com/logs/run-ghi789rst',
    },
    workspace: {
      name: 'project-prod-rollout',
    },
  },
  {
    id: 'run-jkl012mno',
    message: 'Triggered manually via dashboard',
    status: 'applied',
    createdAt: '2025-02-18T00:01:56.946Z',
    confirmedBy: {
      name: 'johnsmith',
      avatar: 'https://www.gravatar.com/avatar/example2?s=100&d=mm',
    },
    plan: {
      logs: 'https://example.com/logs/run-jkl012mno',
    },
    workspace: {
      name: 'project-infra-deploy',
    },
  },
  {
    id: 'run-pqr345stu',
    message: 'feat: add cost analysis dashboard\n',
    status: 'planned_and_finished',
    createdAt: '2024-12-31T18:38:53.577Z',
    confirmedBy: null,
    plan: {
      logs: 'https://example.com/logs/run-pqr345stu',
    },
    workspace: {
      name: 'project-cost-dashboard',
    },
  },
  {
    id: 'run-vwx678yz1',
    message: 'Triggered via UI for validation',
    status: 'applied',
    createdAt: '2024-10-28T09:54:16.187Z',
    confirmedBy: {
      name: 'alicescott',
      avatar: 'https://www.gravatar.com/avatar/example3?s=100&d=mm',
    },
    plan: {
      logs: 'https://example.com/logs/run-vwx678yz1',
    },
    workspace: {
      name: 'project-network-config',
    },
  },
];

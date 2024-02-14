export const mockConfig = {
  app: {
    title: 'Backstage Test App',
  },
  backend: {
    baseUrl: 'http://localhost:7007',
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
  integrations: {
    terraform: {
      token: 'fakeToken',
    },
  },
};

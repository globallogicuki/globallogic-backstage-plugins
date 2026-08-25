import { entityHref } from './links';

describe('entityHref', () => {
  it('links to the component catalog page', () => {
    expect(entityHref('component:default/my-service')).toBe(
      '/catalog/default/component/my-service',
    );
  });

  it('lowercases the kind and keeps the namespace', () => {
    expect(entityHref('Component:team-x/api')).toBe(
      '/catalog/team-x/component/api',
    );
  });
});

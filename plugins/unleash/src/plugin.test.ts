import {
  unleashPlugin,
  EntityUnleashCard,
  EntityUnleashContent,
  UnleashPage,
} from './plugin';

describe('unleash plugin', () => {
  it('should export plugin', () => {
    expect(unleashPlugin).toBeDefined();
  });

  it('should export EntityUnleashCard', () => {
    expect(EntityUnleashCard).toBeDefined();
  });

  it('should export EntityUnleashContent', () => {
    expect(EntityUnleashContent).toBeDefined();
  });

  it('should export UnleashPage', () => {
    expect(UnleashPage).toBeDefined();
  });
});

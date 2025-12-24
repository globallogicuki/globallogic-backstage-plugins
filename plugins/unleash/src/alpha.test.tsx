/**
 * Tests for Unleash plugin New Frontend System extensions
 */
import {
  unleashApiExtension,
  unleashPageExtension,
  unleashEntityCardExtension,
  unleashEntityContentExtension,
} from './alpha';
import { UnleashApiClient } from './api';

// Mock the component imports
jest.mock('./components/UnleashPage', () => ({
  UnleashPage: () => null,
}));

jest.mock('./components/EntityUnleashCard', () => ({
  EntityUnleashCard: () => null,
}));

jest.mock('./components/EntityUnleashContent', () => ({
  EntityUnleashContent: () => null,
}));

describe('Unleash Frontend Extensions', () => {
  describe('unleashApiExtension', () => {
    it('is defined', () => {
      expect(unleashApiExtension).toBeDefined();
    });

    it('has correct extension type', () => {
      expect(unleashApiExtension).toHaveProperty('$$type');
      expect(unleashApiExtension.$$type).toBe('@backstage/ExtensionDefinition');
    });
  });

  describe('unleashPageExtension', () => {
    it('is defined', () => {
      expect(unleashPageExtension).toBeDefined();
    });

    it('has correct extension type', () => {
      expect(unleashPageExtension).toHaveProperty('$$type');
      expect(unleashPageExtension.$$type).toBe(
        '@backstage/ExtensionDefinition',
      );
    });
  });

  describe('unleashEntityCardExtension', () => {
    it('is defined', () => {
      expect(unleashEntityCardExtension).toBeDefined();
    });

    it('has correct extension type', () => {
      expect(unleashEntityCardExtension).toHaveProperty('$$type');
      expect(unleashEntityCardExtension.$$type).toBe(
        '@backstage/ExtensionDefinition',
      );
    });
  });

  describe('unleashEntityContentExtension', () => {
    it('is defined', () => {
      expect(unleashEntityContentExtension).toBeDefined();
    });

    it('has correct extension type', () => {
      expect(unleashEntityContentExtension).toHaveProperty('$$type');
      expect(unleashEntityContentExtension.$$type).toBe(
        '@backstage/ExtensionDefinition',
      );
    });
  });

  describe('default export', () => {
    it('exports all extensions as an array', async () => {
      const defaultExport = await import('./alpha');
      expect(defaultExport.default).toBeDefined();
      expect(Array.isArray(defaultExport.default)).toBe(true);
      expect(defaultExport.default).toHaveLength(4);
    });

    it('includes all extension definitions', async () => {
      const defaultExport = await import('./alpha');
      const extensions = defaultExport.default;

      expect(extensions).toContain(unleashApiExtension);
      expect(extensions).toContain(unleashPageExtension);
      expect(extensions).toContain(unleashEntityCardExtension);
      expect(extensions).toContain(unleashEntityContentExtension);
    });
  });

  describe('extension integration', () => {
    it('all extensions have correct Backstage extension type', () => {
      const extensions = [
        unleashApiExtension,
        unleashPageExtension,
        unleashEntityCardExtension,
        unleashEntityContentExtension,
      ];

      extensions.forEach(extension => {
        expect(extension).toHaveProperty('$$type');
        expect(extension.$$type).toBe('@backstage/ExtensionDefinition');
      });
    });
  });

  describe('type safety', () => {
    it('UnleashApiClient is correctly typed', () => {
      // Verify that UnleashApiClient exists and can be instantiated
      const mockDiscoveryApi = {
        getBaseUrl: jest.fn().mockResolvedValue('http://localhost'),
      };
      const mockFetchApi = {
        fetch: jest.fn(),
      };

      const client = new UnleashApiClient(
        mockDiscoveryApi as any,
        mockFetchApi as any,
      );

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(UnleashApiClient);
    });
  });
});

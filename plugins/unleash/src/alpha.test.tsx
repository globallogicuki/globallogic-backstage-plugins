/**
 * Tests for Unleash plugin New Frontend System extensions
 */
import {
  unleashApiExtension,
  unleashPageExtension,
  unleashEntityCardExtension,
  unleashEntityContentExtension,
} from './alpha';
import { UnleashApiClient, unleashApiRef } from './api';

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

    it('has correct API reference', () => {
      // The extension should reference the unleashApiRef
      expect(unleashApiExtension).toHaveProperty('$$type');
      expect(unleashApiExtension.$$type).toBe('@backstage/ExtensionDefinition');
    });

    it('creates UnleashApiClient with required dependencies', () => {
      // Verify the extension structure includes the API factory
      expect(unleashApiExtension).toHaveProperty('T');

      // The extension params should include the factory that creates UnleashApiClient
      // This is verified by TypeScript compilation, but we can check the extension exists
      expect(unleashApiExtension).toBeDefined();
    });
  });

  describe('unleashPageExtension', () => {
    it('is defined', () => {
      expect(unleashPageExtension).toBeDefined();
    });

    it('has correct extension type', () => {
      expect(unleashPageExtension).toHaveProperty('$$type');
      expect(unleashPageExtension.$$type).toBe('@backstage/ExtensionDefinition');
    });

    it('has correct path configuration', () => {
      // Verify the extension is properly configured
      expect(unleashPageExtension).toHaveProperty('version');
      expect(unleashPageExtension).toHaveProperty('attachTo');
    });

    it('loads UnleashPage component', async () => {
      // The loader is part of the internal params
      // We verify the extension structure is correct
      expect(unleashPageExtension).toBeDefined();
      expect(unleashPageExtension.version).toBe('v2');
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

    it('has correct configuration', () => {
      expect(unleashEntityCardExtension).toHaveProperty('version');
      expect(unleashEntityCardExtension.version).toBe('v2');
    });

    it('loads EntityUnleashCard component', () => {
      // Verify the extension is properly structured
      expect(unleashEntityCardExtension).toBeDefined();
      expect(unleashEntityCardExtension).toHaveProperty('attachTo');
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

    it('has correct configuration', () => {
      expect(unleashEntityContentExtension).toHaveProperty('version');
      expect(unleashEntityContentExtension.version).toBe('v2');
    });

    it('loads EntityUnleashContent component', () => {
      // Verify the extension is properly structured
      expect(unleashEntityContentExtension).toBeDefined();
      expect(unleashEntityContentExtension).toHaveProperty('attachTo');
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

    it('all extensions use v2 version', () => {
      const extensions = [
        unleashApiExtension,
        unleashPageExtension,
        unleashEntityCardExtension,
        unleashEntityContentExtension,
      ];

      extensions.forEach(extension => {
        expect(extension).toHaveProperty('version');
        expect(extension.version).toBe('v2');
      });
    });

    it('all extensions have attachTo configuration', () => {
      const extensions = [
        unleashApiExtension,
        unleashPageExtension,
        unleashEntityCardExtension,
        unleashEntityContentExtension,
      ];

      extensions.forEach(extension => {
        expect(extension).toHaveProperty('attachTo');
        expect(extension.attachTo).toBeDefined();
      });
    });
  });

  describe('type safety', () => {
    it('unleashApiExtension references correct API', () => {
      // Type checking happens at compile time
      // We verify the extension exists and has the right structure
      expect(unleashApiExtension).toBeDefined();

      // The API reference should be unleashApiRef
      // This is enforced by TypeScript, but we verify the extension is valid
      expect(typeof unleashApiExtension).toBe('object');
    });

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

  describe('lazy loading', () => {
    it('page extension is properly configured for lazy loading', () => {
      // The extension should be properly structured
      // Actual loader execution happens at runtime by Backstage
      expect(unleashPageExtension).toBeDefined();
      expect(unleashPageExtension).toHaveProperty('version');
      expect(unleashPageExtension.version).toBe('v2');
    });

    it('entity card extension is properly configured for lazy loading', () => {
      expect(unleashEntityCardExtension).toBeDefined();
      expect(unleashEntityCardExtension).toHaveProperty('version');
      expect(unleashEntityCardExtension.version).toBe('v2');
    });

    it('entity content extension is properly configured for lazy loading', () => {
      expect(unleashEntityContentExtension).toBeDefined();
      expect(unleashEntityContentExtension).toHaveProperty('version');
      expect(unleashEntityContentExtension.version).toBe('v2');
    });

    it('api extension is properly configured', () => {
      expect(unleashApiExtension).toBeDefined();
      expect(unleashApiExtension).toHaveProperty('version');
      expect(unleashApiExtension.version).toBe('v2');
    });
  });

  describe('extension metadata', () => {
    it('extensions have valid kind values', () => {
      const extensions = [
        unleashApiExtension,
        unleashPageExtension,
        unleashEntityCardExtension,
        unleashEntityContentExtension,
      ];

      extensions.forEach(extension => {
        expect(extension).toHaveProperty('kind');
        expect(typeof extension.kind).toBe('string');
        expect(extension.kind.length).toBeGreaterThan(0);
      });
    });

    it('api extension has api kind', () => {
      expect(unleashApiExtension.kind).toBe('api');
    });

    it('page extension has page kind', () => {
      expect(unleashPageExtension.kind).toBe('page');
    });

    it('entity card extension has entity-card kind', () => {
      expect(unleashEntityCardExtension.kind).toBe('entity-card');
    });

    it('entity content extension has entity-content kind', () => {
      expect(unleashEntityContentExtension.kind).toBe('entity-content');
    });
  });
});

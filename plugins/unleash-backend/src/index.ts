/**
 * Unleash backend plugin for Backstage
 * @packageDocumentation
 */
// TODO [LS] - look into why we've got the plugin exported in 2 different ways...
export { unleashPlugin as default } from './plugin';
export { unleashPlugin } from './plugin';
export { createRouter } from './router';
export type { RouterOptions } from './router';

/**
 * Re-export the React Context-based store.
 * All existing `import { useConfigStore } from './store/configStore'` imports
 * continue to work — no consumer changes needed.
 */
export { useConfigStore, ConfigProvider } from './configContext';
export type { ConfigStoreAPI } from './configContext';

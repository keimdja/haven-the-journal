// Runs before every spec. jsdom has no IndexedDB, so give Dexie an in-memory one
// before any spec (or Dexie itself) is loaded.
import 'fake-indexeddb/auto';

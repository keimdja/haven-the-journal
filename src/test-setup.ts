// Runs before every spec. jsdom has no IndexedDB, so give Dexie an in-memory one
// before any spec (or Dexie itself) is loaded.
import 'fake-indexeddb/auto';

// jsdom has <dialog> but not showModal()/close(). These stand in for them: they
// only toggle `open` and fire "close", which is all the bottom sheet relies on.
const dialog = HTMLDialogElement.prototype;
dialog.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
dialog.close ??= function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

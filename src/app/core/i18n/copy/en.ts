/**
 * Every word the app shows, in English. This file defines the shape: `Copy` is
 * its type, so es.ts must have exactly the same keys or the build fails.
 * (No `as const`: the values are plain strings, so Spanish can differ.)
 */
export const en = {
  nav: {
    label: 'Main',
    home: 'Home',
    journal: 'Journal',
    settings: 'Settings',
  },
  sidebar: {
    privacy: 'Your entries are private to your account.',
  },
  settings: {
    title: 'Settings',
    language: {
      heading: 'Language',
      note: 'Changing this only affects the app. Your entries stay in whatever language you wrote them.',
    },
    account: {
      heading: 'Account',
      name: 'Name',
      email: 'Email',
    },
    privacy: {
      heading: 'Privacy',
      hidePreviews: 'Hide previews on Home',
      hidePreviewsSub: 'Show titles only, not what you wrote.',
    },
    journal: {
      heading: 'Your journal',
      export: 'Export journal',
      exportSub: 'Download every entry as a file you can keep.',
    },
    care: 'Haven is a space for personal reflection. It isn’t a substitute for professional care.',
    signOut: 'Sign out',
  },
};

export type Copy = typeof en;

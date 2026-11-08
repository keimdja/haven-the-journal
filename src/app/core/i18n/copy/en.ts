import type { FeelingKey } from '../../data/feelings';
import type { PatternKey } from '../../data/patterns';
import type { ReflectionPartKey } from '../../data/reflection-parts';

/**
 * Every word the app shows, in English. This file defines the shape: `Copy` is
 * its type, so es.ts must have exactly the same keys or the build fails.
 * (No `as const`: the values are plain strings, so Spanish can differ.)
 */
export const en = {
  login: {
    title: 'Sign in',
    intro: 'Your journal is waiting, just as you left it.',
    email: 'Email',
    password: 'Password',
    submit: 'Continue',
    submitting: 'Signing in…',
    missing: 'Enter your email and password.',
    wrongDetails: 'That email and password don’t match.',
    failed: 'Couldn’t reach Haven. Check your connection and try again.',
  },
  nav: {
    label: 'Main',
    home: 'Home',
    journal: 'Journal',
    settings: 'Settings',
  },
  sidebar: {
    privacy: 'Your entries are private to your account.',
  },
  home: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
  },
  feelings: {
    calm: 'Calm',
    content: 'Content',
    grateful: 'Grateful',
    hopeful: 'Hopeful',
    tender: 'Tender',
    relieved: 'Relieved',
    proud: 'Proud',
    tired: 'Tired',
    restless: 'Restless',
    unsure: 'Unsure',
    anxious: 'Anxious',
    sad: 'Sad',
    frustrated: 'Frustrated',
    lonely: 'Lonely',
  } satisfies Record<FeelingKey, string>,
  patterns: {
    minimize_magnify: {
      label: 'Shrinking the good, magnifying the bad',
      example: '“That went fine, but this ruins everything.”',
    },
    predicting_future: { label: 'Predicting the future', example: '“This is going to go badly.”' },
    reading_minds: { label: 'Reading minds', example: '“They must think I’m…”' },
    catastrophizing: { label: 'Seeing a catastrophe', example: '“This is a disaster.”' },
    extreme_thinking: { label: 'Thinking in extremes', example: '“If they fall, they’ll die.”' },
    jumping_to_conclusions: {
      label: 'Jumping to conclusions',
      example: '“I already know what this means.”',
    },
    blaming_myself: { label: 'Blaming myself for everything', example: '“It’s all my fault.”' },
    blaming_others: { label: 'Blaming others', example: '“They did this to me.”' },
    not_questioning: {
      label: 'Accepting without questioning',
      example: '“That’s just how it is.”',
    },
    feelings_as_facts: { label: 'Feelings as facts', example: '“I feel it, so it must be true.”' },
    should_statements: {
      label: '“Should have” thinking',
      example: '“It should have gone differently.”',
    },
  } satisfies Record<PatternKey, { label: string; example: string }>,
  reflect: {
    saveExit: 'Save & exit',
    part: 'Part',
    progress: 'Reflection progress',
    back: 'Back',
    skip: 'Skip for now',
    continue: 'Continue',
    parts: {
      whatHappened: {
        question: 'What happened?',
        helper:
          'Describe the facts of the moment that upset you or made you uncomfortable. Just what happened, not what it meant.',
        nudges: [
          'Where were you, and who was there?',
          'What happened right before?',
          'What was said or done?',
        ],
      },
      thoughts: {
        question: 'What went through my mind?',
        helper:
          'Write down the negative thoughts that crossed your mind while it was happening. They don’t need to make sense yet.',
        nudges: [
          'What was the first thing you thought?',
          'Was there a thought that kept coming back?',
          'What did you imagine others were thinking?',
        ],
      },
      feelings: {
        question: 'What did I feel?',
        helper: 'Name the emotions you felt during the moment. Choose any, or add your own.',
        nudges: [],
      },
      patterns: {
        question: 'What thinking patterns do I recognize?',
        helper: 'Notice the shape of your thinking. Noticing one doesn’t mean anything is wrong.',
        nudges: [],
      },
      reframe: {
        question: 'How can I think about this differently?',
        helper: 'Consider what you learned from the experience. It’s okay if nothing comes yet.',
        nudges: [
          'What would you say to a friend in the same spot?',
          'Is there anything you might not know yet?',
          'What did this teach you?',
        ],
      },
      gratitude: {
        question: 'What am I grateful for?',
        helper:
          'Write down at least one thing you feel grateful for. Something can hurt, and something else can still be good.',
        nudges: ['It can be small. A person, a moment, a cup of coffee.'],
      },
    } satisfies Record<ReflectionPartKey, { question: string; helper: string; nudges: string[] }>,
    noPatternFits: 'None of these fit? That’s fine, you can skip this one.',
  },
  entry: {
    untitled: 'Untitled',
    draft: 'Draft',
    ofSix: 'of 6',
    edit: 'Edit',
    delete: {
      action: 'Delete this entry',
      heading: 'Delete this entry?',
      body: 'will be removed from your journal. This can’t be undone.',
      bodyUntitled: 'This entry will be removed from your journal. This can’t be undone.',
      wantCopy: 'Want a copy first?',
      export: 'Export your journal',
      keep: 'Keep entry',
      confirm: 'Delete',
    },
    patterns: 'Thinking patterns',
    feelings: 'Feelings',
    kind: {
      free: 'Free writing',
      reflection: 'Reflection',
    },
  },
  export: {
    title: 'Haven journal',
    exportedOn: 'Exported:',
  },
  saveStatus: {
    saving: 'Saving…',
    saved: 'Saved',
    offline: 'Offline — saved on this device',
    error: 'Couldn’t save.',
    retry: 'Try again',
  },
  write: {
    home: 'Home',
    done: 'Done',
    titleLabel: 'Title (optional)',
    titlePlaceholder: 'Untitled',
    bodyLabel: 'Your entry',
    bodyPlaceholder: 'Start wherever you like…',
  },
  feelingPicker: {
    label: 'Feelings',
    add: 'Add a feeling',
    edit: 'Edit feelings',
    heading: 'How does this feel?',
    sub: 'Optional. Choose any, or none.',
    done: 'Done',
    addOwn: 'Add your own',
    addOwnHint: '(press Enter)',
    remove: 'Remove',
    limit: 'That’s as many as one entry can hold.',
  },
  journal: {
    filter: {
      label: 'Show',
      all: 'All',
      free: 'Free writing',
      reflection: 'Reflections',
    },
    empty: 'Nothing here yet. Your entries will appear as you write.',
    search: 'Search your entries',
    noMatches: 'Nothing matches that. Try another word, or show all your entries.',
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
    signOutWarning: {
      heading: 'Sign out before this has synced?',
      body: 'Some of what you wrote hasn’t reached your account yet. Signing out now erases it from this device, and it can’t be recovered.',
      stay: 'Stay signed in',
      confirm: 'Sign out anyway',
    },
  },
};

export type Copy = typeof en;

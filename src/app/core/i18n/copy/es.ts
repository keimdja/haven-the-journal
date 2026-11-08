import type { Copy } from './en';

/** Every word the app shows, in Spanish. Written for Spanish readers, not translated word for word. */
export const es: Copy = {
  nav: {
    label: 'Principal',
    home: 'Inicio',
    journal: 'Diario',
    settings: 'Ajustes',
  },
  sidebar: {
    privacy: 'Tus entradas son privadas y solo se ven desde tu cuenta.',
  },
  settings: {
    title: 'Ajustes',
    language: {
      heading: 'Idioma',
      note: 'Esto solo cambia la app. Tus entradas se quedan en el idioma en que las escribiste.',
    },
    account: {
      heading: 'Cuenta',
      name: 'Nombre',
      email: 'Correo',
    },
    privacy: {
      heading: 'Privacidad',
      hidePreviews: 'Ocultar vistas previas en Inicio',
      hidePreviewsSub: 'Mostrar solo los títulos, no lo que escribiste.',
    },
    journal: {
      heading: 'Tu diario',
      export: 'Exportar diario',
      exportSub: 'Descarga todas tus entradas en un archivo para guardarlo.',
    },
    care: 'Haven es un espacio para la reflexión personal. No sustituye la atención profesional.',
    signOut: 'Cerrar sesión',
  },
};

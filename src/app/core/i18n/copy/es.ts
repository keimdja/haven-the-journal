import type { Copy } from './en';

/** Every word the app shows, in Spanish. Written for Spanish readers, not translated word for word. */
export const es: Copy = {
  login: {
    title: 'Inicia sesión',
    intro: 'Tu diario te espera, tal como lo dejaste.',
    email: 'Correo',
    password: 'Contraseña',
    submit: 'Continuar',
    submitting: 'Entrando…',
    missing: 'Escribe tu correo y tu contraseña.',
    wrongDetails: 'El correo y la contraseña no coinciden.',
    failed: 'No pudimos conectar con Haven. Revisa tu conexión e inténtalo otra vez.',
  },
  nav: {
    label: 'Principal',
    home: 'Inicio',
    journal: 'Diario',
    settings: 'Ajustes',
  },
  sidebar: {
    privacy: 'Tus entradas son privadas y solo se ven desde tu cuenta.',
  },
  home: {
    greeting: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches',
    },
  },
  feelings: {
    calm: 'Calma',
    content: 'Satisfacción',
    grateful: 'Gratitud',
    hopeful: 'Esperanza',
    tender: 'Ternura',
    relieved: 'Alivio',
    proud: 'Orgullo',
    tired: 'Cansancio',
    restless: 'Inquietud',
    unsure: 'Inseguridad',
    anxious: 'Ansiedad',
    sad: 'Tristeza',
    frustrated: 'Frustración',
    lonely: 'Soledad',
  },
  patterns: {
    minimize_magnify: {
      label: 'Achicar lo bueno, agrandar lo malo',
      example: '“Eso salió bien, pero esto lo arruina todo.”',
    },
    predicting_future: { label: 'Predecir el futuro', example: '“Esto va a salir mal.”' },
    reading_minds: { label: 'Leer mentes', example: '“Seguro piensa que soy…”' },
    catastrophizing: { label: 'Verlo como una catástrofe', example: '“Esto es un desastre.”' },
    extreme_thinking: { label: 'Pensar en extremos', example: '“Si se cae, se muere.”' },
    jumping_to_conclusions: {
      label: 'Sacar conclusiones apresuradas',
      example: '“Ya sé lo que esto significa.”',
    },
    blaming_myself: { label: 'Culparme de todo', example: '“Todo es mi culpa.”' },
    blaming_others: { label: 'Culpar a los demás', example: '“Me hicieron esto.”' },
    not_questioning: { label: 'Aceptar sin cuestionar', example: '“Así son las cosas.”' },
    feelings_as_facts: {
      label: 'Confundir emociones con hechos',
      example: '“Lo siento, así que debe ser verdad.”',
    },
    should_statements: {
      label: 'Pensar en lo que “debió” pasar',
      example: '“Debió haber salido de otra manera.”',
    },
  },
  reflect: {
    saveExit: 'Guardar y salir',
    part: 'Parte',
    progress: 'Progreso de la reflexión',
    back: 'Atrás',
    skip: 'Omitir por ahora',
    continue: 'Continuar',
    parts: {
      whatHappened: {
        question: '¿Qué pasó?',
        helper:
          'Describe los hechos del momento que te molestó o te causó incomodidad. Solo lo que pasó, no lo que significó.',
        nudges: [
          '¿Dónde estabas y quién estaba?',
          '¿Qué pasó justo antes?',
          '¿Qué se dijo o se hizo?',
        ],
      },
      thoughts: {
        question: '¿Qué pensé o qué pasó por mi mente?',
        helper:
          'Escribe los pensamientos negativos que cruzaron tu mente mientras ocurría. No tienen que tener sentido todavía.',
        nudges: [
          '¿Qué fue lo primero que pensaste?',
          '¿Hubo un pensamiento que volvía una y otra vez?',
          '¿Qué imaginaste que pensaban los demás?',
        ],
      },
      feelings: {
        question: '¿Qué sentí?',
        helper:
          'Nombra las emociones que sentiste en ese momento. Elige las que quieras o escribe las tuyas.',
        nudges: [],
      },
      patterns: {
        question: '¿Qué patrón de pensamiento reconozco?',
        helper: 'Observa la forma de tu pensamiento. Notar uno no significa que algo ande mal.',
        nudges: [],
      },
      reframe: {
        question: '¿Cómo puedo pensar diferente sobre esta experiencia?',
        helper:
          'Piensa en lo que aprendiste de lo que pasó. Está bien si todavía no se te ocurre nada.',
        nudges: [
          '¿Qué le dirías a una amistad en la misma situación?',
          '¿Hay algo que quizás todavía no sabes?',
          '¿Qué te enseñó esto?',
        ],
      },
      gratitude: {
        question: '¿Qué agradezco?',
        helper:
          'Escribe al menos una cosa que agradeces. Algo puede doler y otra cosa puede seguir siendo buena.',
        nudges: ['Puede ser algo pequeño. Una persona, un momento, una taza de café.'],
      },
    },
    noPatternFits: '¿Ninguno encaja? Está bien, puedes saltar esta parte.',
  },
  entry: {
    untitled: 'Sin título',
    draft: 'Borrador',
    ofSix: 'de 6',
    edit: 'Editar',
    delete: {
      action: 'Eliminar esta entrada',
      heading: '¿Eliminar esta entrada?',
      body: 'se eliminará de tu diario. Esto no se puede deshacer.',
      bodyUntitled: 'Esta entrada se eliminará de tu diario. Esto no se puede deshacer.',
      wantCopy: '¿Quieres una copia antes?',
      export: 'Exporta tu diario',
      keep: 'Conservar entrada',
      confirm: 'Eliminar',
    },
    patterns: 'Patrones de pensamiento',
    feelings: 'Lo que sentí',
    kind: {
      free: 'Escritura libre',
      reflection: 'Reflexión',
    },
  },
  export: {
    title: 'Diario de Haven',
    exportedOn: 'Exportado:',
  },
  saveStatus: {
    saving: 'Guardando…',
    saved: 'Guardado',
    offline: 'Sin conexión: guardado en este dispositivo',
    error: 'No se pudo guardar.',
    retry: 'Intentar de nuevo',
  },
  write: {
    home: 'Inicio',
    done: 'Listo',
    titleLabel: 'Título (opcional)',
    titlePlaceholder: 'Sin título',
    bodyLabel: 'Tu entrada',
    bodyPlaceholder: 'Empieza por donde quieras…',
  },
  feelingPicker: {
    label: 'Emociones',
    add: 'Agregar una emoción',
    edit: 'Editar emociones',
    heading: '¿Cómo se siente esto?',
    sub: 'Opcional. Elige las que quieras o ninguna.',
    done: 'Listo',
    addOwn: 'Agrega la tuya',
    addOwnHint: '(pulsa Intro)',
    remove: 'Quitar',
    limit: 'Ya son todas las que caben en una entrada.',
  },
  journal: {
    filter: {
      label: 'Mostrar',
      all: 'Todas',
      free: 'Escritura libre',
      reflection: 'Reflexiones',
    },
    empty: 'Todavía no hay nada aquí. Tus entradas aparecerán a medida que escribas.',
    search: 'Busca en tus entradas',
    noMatches: 'Nada coincide con eso. Prueba otra palabra o muestra todas tus entradas.',
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
    signOutWarning: {
      heading: '¿Cerrar sesión antes de sincronizar?',
      body: 'Parte de lo que escribiste todavía no ha llegado a tu cuenta. Si cierras sesión ahora, se borrará de este dispositivo y no se podrá recuperar.',
      stay: 'Seguir con la sesión',
      confirm: 'Cerrar sesión de todos modos',
    },
  },
};

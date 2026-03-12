import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'es' | 'en';

const translations = {
  es: {
    // Nav / Sidebar
    nav: {
      dashboard: 'Dashboard',
      myRoutines: 'Mis rutinas',
      history: 'Historial',
      exercises: 'Ejercicios',
      statistics: 'Estadísticas',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
    },

    // Landing
    landing: {
      heroTitle: 'ENTRENA SIN LÍMITES',
      heroSubtitle: 'La app de fitness que se adapta a tu ritmo. Registra, analiza y supera tus límites cada día.',
      ctaStart: 'EMPEZAR AHORA',
      ctaLogin: 'Ya tengo cuenta',
      featuresTitle: 'TODO LO QUE NECESITAS',
      feature1Title: 'Rutinas personalizadas',
      feature1Desc: 'Crea y gestiona tus propias rutinas de entrenamiento adaptadas a tus objetivos.',
      feature2Title: 'Seguimiento de progreso',
      feature2Desc: 'Visualiza tu evolución con gráficas detalladas de volumen, peso y repeticiones.',
      feature3Title: 'Historial completo',
      feature3Desc: 'Consulta cada sesión pasada con todos los detalles de series, reps y kilos.',
      ctaFinal: '¿LISTO PARA EMPEZAR?',
      ctaFinalSub: 'Únete y empieza a entrenar de forma inteligente.',
      ctaFinalBtn: 'CREAR CUENTA GRATIS',
      feature1CardTitle: 'Sin Plantillas Rígidas',
      feature1CardDesc: 'Crea rutinas 100% personalizadas',
      feature2CardTitle: 'Sobrecarga Progresiva',
      feature2CardDesc: 'Seguimiento automático de tu progreso',
      feature3CardTitle: 'Rápido y Offline',
      feature3CardDesc: 'Funciona sin conexión a internet',
      featuresSubtitle: 'Diseña tus rutinas y deja que la app gestione el entrenamiento por ti',
      heroTitleAlt: 'DOMINA TU PROGRESO',
      heroSubtitleAlt: 'La app definitiva para tus entrenamientos de fuerza',
      ctaStartAlt: 'Empezar',
      howItWorks: 'Cómo funciona DailySet',
      step1: 'Diseña',
      step2: 'Registra',
      step3: 'Analiza',
      ctaFinalTitleAlt: 'Deja el papel en el pasado.',
      ctaFinalSubAlt: 'Empieza a controlar tu mejor versión hoy mismo.',
      ctaFinalBtnAlt: 'Comenzar',
      footerText: '2026 DailySet - Tu compañero de entrenamiento',
    },

    // Auth
    auth: {
      login: 'Iniciar sesión',
      register: 'Crear cuenta',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      name: 'Nombre',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      signUp: 'Regístrate',
      signIn: 'Inicia sesión',
      loginBtn: 'ENTRAR',
      registerBtn: 'CREAR CUENTA',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      weekVolume: 'Volumen semanal',
      myRoutines: 'Mis rutinas',
      recentActivity: 'Actividad reciente',
      startTraining: 'Iniciar entrenamiento',
      noActivity: 'Sin actividad reciente',
      kg: 'kg',
      series: 'series',
    },

    // Routines
    routines: {
      title: 'Mis rutinas',
      newRoutine: 'Nueva rutina',
      editRoutine: 'Editar rutina',
      deleteRoutine: 'Eliminar rutina',
      routineName: 'Nombre de la rutina',
      category: 'Categoría',
      duration: 'Duración (min)',
      exercises: 'Ejercicios',
      addExercises: 'Gestionar ejercicios',
      confirmDelete: '¿Eliminar esta rutina?',
      confirmDeleteDesc: 'Esta acción no se puede deshacer.',
      noRoutines: 'Aún no tienes rutinas.',
      startTraining: 'Iniciar',
      min: 'min',
      all: 'Todos',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      exercisesInRoutine: 'Ejercicios en la rutina',
      availableExercises: 'Ejercicios disponibles',
      noExercisesInRoutine: 'Sin ejercicios asignados.',
    },

    // Training
    training: {
      title: 'Entrenamiento',
      series: 'Series',
      previous: 'Anterior',
      kg: 'kg',
      reps: 'Reps',
      done: 'Hecho',
      finishTraining: 'Finalizar entrenamiento',
      addSeries: '+ Serie',
      set: 'Serie',
      back: 'Volver',
    },

    // Exercises
    exercises: {
      title: 'Ejercicios',
      newExercise: 'Nuevo ejercicio',
      editExercise: 'Editar ejercicio',
      deleteExercise: 'Eliminar ejercicio',
      exerciseName: 'Nombre del ejercicio',
      muscleGroup: 'Grupo muscular',
      category: 'Categoría',
      description: 'Descripción',
      search: 'Buscar ejercicio...',
      confirmDelete: '¿Eliminar este ejercicio?',
      confirmDeleteDesc: 'Esta acción no se puede deshacer.',
      noResults: 'No se encontraron ejercicios.',
      all: 'Todos',
      viewDetail: 'Ver detalle',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
    },

    // Exercise detail
    exerciseDetail: {
      progressHistory: 'Historial de progreso',
      lastSessions: 'Últimas sesiones',
      maxWeight: 'Peso máximo',
      dateCol: 'Fecha',
      back: '← Volver',
    },

    // History
    history: {
      title: 'Historial',
      noSession: 'Sin sesión registrada',
      totalVolume: 'Volumen total',
      intensity: 'Intensidad',
      discipline: 'Disciplina',
      sessions: 'Sesiones',
      back: '← Volver al historial',
      noSessionFound: 'No se encontró sesión para esta fecha.',
      kg: 'kg',
      reps: 'reps',
      set: 'Serie',
    },

    // Statistics
    statistics: {
      title: 'Estadísticas',
      totalWorkouts: 'Total de entrenos',
      totalTime: 'Tiempo total',
      caloriesBurned: 'Kcal quemadas',
      monthlyEvolution: 'Evolución mensual',
      workoutsPerMonth: 'Entrenos por mes',
    },

    // Profile
    profile: {
      title: 'Perfil',
      accountSettings: 'Configuración de cuenta',
      language: 'Idioma',
      notifications: 'Notificaciones',
      units: 'Unidades',
      kg: 'Kilogramos (kg)',
      lbs: 'Libras (lbs)',
      darkMode: 'Modo oscuro',
      lightMode: 'Modo claro',
      logout: 'Cerrar sesión',
      logoutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
      save: 'Guardar',
      edit: 'Editar',
      name: 'Nombre',
      totalSets: 'Sets totales',
      streak: 'Racha',
      totalWeight: 'Peso total',
      days: 'días',
    },

    // Progress
    progress: {
      title: 'Tu Evolución',
      subtitle: 'Análisis detallado de tu rendimiento físico.',
      totalVolume: 'Volumen Total',
      sessions: 'Sesiones',
      records: 'Récords (PR)',
      totalTime: 'Tiempo total',
    },

    // Common
    common: {
      loading: 'Cargando...',
      error: 'Ha ocurrido un error.',
      notFound: 'No encontrado.',
      enabled: 'Activado',
      disabled: 'Desactivado',
    },
  },

  en: {
    nav: {
      dashboard: 'Dashboard',
      myRoutines: 'My Routines',
      history: 'History',
      exercises: 'Exercises',
      statistics: 'Statistics',
      profile: 'Profile',
      logout: 'Logout',
    },

    landing: {
      heroTitle: 'TRAIN WITHOUT LIMITS',
      heroSubtitle: 'The fitness app that adapts to your pace. Record, analyze and surpass your limits every day.',
      ctaStart: 'GET STARTED',
      ctaLogin: 'I already have an account',
      featuresTitle: 'EVERYTHING YOU NEED',
      feature1Title: 'Custom routines',
      feature1Desc: 'Create and manage your own training routines tailored to your goals.',
      feature2Title: 'Progress tracking',
      feature2Desc: 'Visualize your evolution with detailed charts of volume, weight and reps.',
      feature3Title: 'Full history',
      feature3Desc: 'Review every past session with full details on sets, reps and kilos.',
      ctaFinal: 'READY TO START?',
      ctaFinalSub: 'Join us and start training smarter.',
      ctaFinalBtn: 'CREATE FREE ACCOUNT',
      feature1CardTitle: 'No Rigid Templates',
      feature1CardDesc: 'Create 100% personalized routines',
      feature2CardTitle: 'Progressive Overload',
      feature2CardDesc: 'Automatic tracking of your progress',
      feature3CardTitle: 'Fast & Offline',
      feature3CardDesc: 'Works without an internet connection',
      featuresSubtitle: 'Design your routines and let the app manage your training for you',
      heroTitleAlt: 'MASTER YOUR PROGRESS',
      heroSubtitleAlt: 'The ultimate app for your strength training',
      ctaStartAlt: 'Get started',
      howItWorks: 'How DailySet works',
      step1: 'Design',
      step2: 'Record',
      step3: 'Analyze',
      ctaFinalTitleAlt: 'Leave paper in the past.',
      ctaFinalSubAlt: 'Start controlling your best self today.',
      ctaFinalBtnAlt: 'Get started',
      footerText: '2026 DailySet - Your training companion',
    },

    auth: {
      login: 'Sign in',
      register: 'Create account',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      name: 'Name',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign up',
      signIn: 'Sign in',
      loginBtn: 'SIGN IN',
      registerBtn: 'CREATE ACCOUNT',
    },

    dashboard: {
      title: 'Dashboard',
      weekVolume: 'Weekly volume',
      myRoutines: 'My routines',
      recentActivity: 'Recent activity',
      startTraining: 'Start training',
      noActivity: 'No recent activity',
      kg: 'kg',
      series: 'sets',
    },

    routines: {
      title: 'My Routines',
      newRoutine: 'New routine',
      editRoutine: 'Edit routine',
      deleteRoutine: 'Delete routine',
      routineName: 'Routine name',
      category: 'Category',
      duration: 'Duration (min)',
      exercises: 'Exercises',
      addExercises: 'Manage exercises',
      confirmDelete: 'Delete this routine?',
      confirmDeleteDesc: 'This action cannot be undone.',
      noRoutines: "You don't have any routines yet.",
      startTraining: 'Start',
      min: 'min',
      all: 'All',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      exercisesInRoutine: 'Exercises in routine',
      availableExercises: 'Available exercises',
      noExercisesInRoutine: 'No exercises assigned.',
    },

    training: {
      title: 'Training',
      series: 'Sets',
      previous: 'Previous',
      kg: 'kg',
      reps: 'Reps',
      done: 'Done',
      finishTraining: 'Finish training',
      addSeries: '+ Set',
      set: 'Set',
      back: 'Back',
    },

    exercises: {
      title: 'Exercises',
      newExercise: 'New exercise',
      editExercise: 'Edit exercise',
      deleteExercise: 'Delete exercise',
      exerciseName: 'Exercise name',
      muscleGroup: 'Muscle group',
      category: 'Category',
      description: 'Description',
      search: 'Search exercise...',
      confirmDelete: 'Delete this exercise?',
      confirmDeleteDesc: 'This action cannot be undone.',
      noResults: 'No exercises found.',
      all: 'All',
      viewDetail: 'View detail',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
    },

    exerciseDetail: {
      progressHistory: 'Progress history',
      lastSessions: 'Last sessions',
      maxWeight: 'Max weight',
      dateCol: 'Date',
      back: '← Back',
    },

    history: {
      title: 'History',
      noSession: 'No session recorded',
      totalVolume: 'Total volume',
      intensity: 'Intensity',
      discipline: 'Discipline',
      sessions: 'Sessions',
      back: '← Back to history',
      noSessionFound: 'No session found for this date.',
      kg: 'kg',
      reps: 'reps',
      set: 'Set',
    },

    statistics: {
      title: 'Statistics',
      totalWorkouts: 'Total workouts',
      totalTime: 'Total time',
      caloriesBurned: 'Calories burned',
      monthlyEvolution: 'Monthly evolution',
      workoutsPerMonth: 'Workouts per month',
    },

    profile: {
      title: 'Profile',
      accountSettings: 'Account settings',
      language: 'Language',
      notifications: 'Notifications',
      units: 'Units',
      kg: 'Kilograms (kg)',
      lbs: 'Pounds (lbs)',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to log out?',
      save: 'Save',
      edit: 'Edit',
      name: 'Name',
      totalSets: 'Total sets',
      streak: 'Streak',
      totalWeight: 'Total weight',
      days: 'days',
    },

    progress: {
      title: 'Your Evolution',
      subtitle: 'Detailed analysis of your physical performance.',
      totalVolume: 'Total Volume',
      sessions: 'Sessions',
      records: 'Records (PR)',
      totalTime: 'Total time',
    },

    common: {
      loading: 'Loading...',
      error: 'An error occurred.',
      notFound: 'Not found.',
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
  },
} as const;

export type Translations = typeof translations.es;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const getSavedLocale = (): Locale => {
    const saved = localStorage.getItem('locale');
    if (saved === 'es' || saved === 'en') return saved;
    const browser = navigator.language.slice(0, 2);
    return browser === 'es' ? 'es' : 'en';
  };

  const [locale, setLocaleState] = useState<Locale>(getSavedLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

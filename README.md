# ⚡ DailySet

**DailySet** es una aplicación web moderna diseñada para atletas que buscan "Dominar su progreso". Permite a los usuarios registrar, visualizar y analizar sus rutinas de entrenamiento diarias con una interfaz vibrante, orientada al rendimiento y con un fuerte enfoque en la experiencia de usuario.

![DailySet Showcase](public/icon-512.png) <!-- Reemplazar con una captura real de la app -->

## ✨ Características Principales
- **Autenticación Segura:** Sistema de login y registro gestionado mediante Supabase.
- **Gestión de Rutinas y Ejercicios:** Crea y personaliza tus propios entrenamientos.
- **Historial de Entrenamientos:** Mantén un registro visual de tu progreso consistente.
- **Estadísticas Dinámicas:** Analiza tus métricas clave (volumen, repeticiones, racha) con gráficos interactivos.
- **Modo Oscuro/Deportivo Nativo:** Interfaz diseñada con alto contraste, acentos de neón y efectos visuales modernos.
- **Soporte Internacional (i18n):** Disponible en varios idiomas.

## 🛠️ Tecnologías Utilizadas
Este proyecto está construido con las herramientas más modernas del ecosistema frontend:

- **[React 18](https://reactjs.org/)** - Biblioteca principal para interfaces de usuario.
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estricto para un código más seguro.
- **[Vite](https://vitejs.dev/)** - Entorno de desarrollo ultra rápido.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de utilidades para un diseño ágil y asombroso.
- **[Supabase](https://supabase.com/)** - Backend as a Service (BaaS) para base de datos PostgreSQL y Auth.
- **[React Router v6](https://reactrouter.com/)** - Enrutamiento declarativo.
- **[Recharts](https://recharts.org/)** - Gráficos y visualización de datos.
- **[Lucide React](https://lucide.dev/)** - Íconos hermosos y consistentes.

## 🚀 Instalación y Uso Local

Sigue estos pasos para arrancar el proyecto en tu máquina local:

### Prerrequisitos
- Node.js (v16+)
- Una cuenta y proyecto creado en [Supabase](https://supabase.com).

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/dailyset.git
cd dailyset
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
```env
VITE_SUPABASE_URL="tu_url_de_supabase"
VITE_SUPABASE_ANON_KEY="tu_anon_key_de_supabase"
```

### 4. Lanzar servidor de desarrollo
```bash
npm run dev
```
La aplicación se abrirá automáticamente en tu navegador o estará disponible en `http://localhost:5173`.

## 📁 Estructura del Proyecto

```text
src/
├── componentes/   # Botones, Formularios, Inputs, Logos y UI reutilizable
├── context/       # Estados globales (Auth, Rutinas, Ejercicios, i18n)
├── lib/           # Utilidades y configuración de clientes (Supabase)
├── paginas/       # Vistas completas de la aplicación (Dashboard, Historial, etc.)
├── styles/        # CSS global y tokens de diseño
└── App.tsx        # Enrutador principal de la app
```

## 🎨 Token de Diseño y Estética
El proyecto no utiliza variables por defecto aburridas. La magia gráfica vive en `src/styles/global.css`, basándose en los siguientes colores:
- **Primary:** `#ebff00` (Amarillo Neón) - *Para acciones clave (Submit, Finalizar)*
- **Accent:** `#5227FF` (Azul Eléctrico) - *Para navegación y focos*
- **Background:** `#0a0a0a` (Casi Negro) - *Fondo inmersivo*

## 📜 Licencia
Este proyecto es de código abierto y está disponible bajo la **Licencia MIT**.

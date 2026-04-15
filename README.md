<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0a,50:5227FF,100:ebff00&height=200&section=header&text=DailySet&fontSize=80&fontColor=ebff00&fontAlignY=38&desc=Domina%20tu%20progreso&descAlignY=58&descSize=22&descColor=ffffff&animation=fadeIn" width="100%"/>

<!-- Typing Animation -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=22&pause=1000&color=EBFF00&center=true&vCenter=true&width=600&lines=Registra+tus+entrenamientos;Visualiza+tu+progreso;Analiza+tus+m%C3%A9tricas+clave;Domina+tu+rendimiento+%F0%9F%92%AA" alt="Typing SVG" />
</a>

<br/>
<br/>

<!-- Badges -->
![React](https://img.shields.io/badge/React_18-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<br/>

![MIT License](https://img.shields.io/badge/License-MIT-ebff00?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-5227FF?style=flat-square)

</div>

---

## ⚡ ¿Qué es DailySet?

**DailySet** es una aplicación web moderna diseñada para atletas que buscan **"Dominar su progreso"**. Permite a los usuarios registrar, visualizar y analizar sus rutinas de entrenamiento diarias con una interfaz vibrante, orientada al rendimiento y con un fuerte enfoque en la experiencia de usuario.

---

## ✨ Características Principales

<div align="center">

| 🔐 Autenticación | 🏋️ Rutinas | 📊 Estadísticas |
|:---:|:---:|:---:|
| Login y registro seguro vía Supabase | Crea y personaliza tus entrenamientos | Métricas clave con gráficos interactivos |
| **📅 Historial** | **🌙 Modo Oscuro** | **🌍 i18n** |
| Registro visual de tu progreso | Alto contraste, neón y efectos modernos | Soporte multiidioma nativo |

</div>

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con las herramientas más modernas del ecosistema frontend:

```
⚛️  React 18        →  Biblioteca principal para interfaces de usuario
🟦  TypeScript      →  Tipado estricto para un código más seguro
⚡  Vite            →  Entorno de desarrollo ultra rápido
🎨  Tailwind CSS    →  Framework de utilidades para diseño ágil
🔋  Supabase        →  BaaS: PostgreSQL + Auth
🛣️  React Router v6 →  Enrutamiento declarativo
📈  Recharts        →  Gráficos y visualización de datos
🎯  Lucide React    →  Íconos hermosos y consistentes
```

---

## 🚀 Instalación y Uso Local

### Prerrequisitos

- **Node.js** v16+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/dailyset.git
cd dailyset
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:
```env
VITE_SUPABASE_URL="tu_url_de_supabase"
VITE_SUPABASE_ANON_KEY="tu_anon_key_de_supabase"
```

**4. Lanzar servidor de desarrollo**
```bash
npm run dev
```

> La app estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
src/
├── 🧩 componentes/   # Botones, Formularios, Inputs, Logos y UI reutilizable
├── 🌐 context/       # Estados globales (Auth, Rutinas, Ejercicios, i18n)
├── 🔧 lib/           # Utilidades y configuración de clientes (Supabase)
├── 📄 paginas/       # Vistas completas (Dashboard, Historial, etc.)
├── 🎨 styles/        # CSS global y tokens de diseño
└── 🚀 App.tsx        # Enrutador principal de la app
```

---

## 🎨 Design Tokens   

La magia gráfica vive en `src/styles/global.css`:

<div align="center">

| Token | Color | Uso |
|:---:|:---:|:---|
| **Primary** | ![#ebff00](https://img.shields.io/badge/%23ebff00-ebff00?style=flat-square&color=ebff00) `#ebff00` | Acciones clave — Submit, Finalizar |
| **Accent** | ![#5227FF](https://img.shields.io/badge/%235227FF-5227FF?style=flat-square&color=5227FF) `#5227FF` | Navegación y focos |
| **Background** | ![#0a0a0a](https://img.shields.io/badge/%230a0a0a-0a0a0a?style=flat-square&color=0a0a0a) `#0a0a0a` | Fondo inmersivo |

</div>

---

## 📜 Licencia

Este proyecto es de código abierto y está disponible bajo la **Licencia MIT**.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ebff00,50:5227FF,100:0a0a0a&height=120&section=footer" width="100%"/>

**Hecho con 💛 para atletas que no se rinden**

</div>
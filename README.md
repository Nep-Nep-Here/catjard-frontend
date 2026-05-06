# Cat Jard — Landing Page

Merchandising corporativo · Lima, Perú.

## Setup

```bash
npm install
npm run dev
```

Abre automáticamente en `http://localhost:5173`.

## Scripts

- `npm run dev` — servidor de desarrollo (Vite, hot reload)
- `npm run build` — build de producción a `dist/`
- `npm run preview` — preview del build
- `npm run lint` — corre ESLint

## Estructura

```
.
├── public/                  Servidos en raíz (/transition.mp4, /hero-poster.png)
├── src/
│   ├── assets/              Imágenes/íconos importados desde código
│   ├── components/          Componentes UI reutilizables
│   │   ├── Icons.jsx        Set de íconos SVG inline + marca Cat Jard
│   │   └── Primitives.jsx   PrimaryCTA, DarkCTA, GhostCTA, SectionTitle
│   ├── layout/              Layout
│   │   └── Layout.jsx       Navbar + Footer
│   ├── pages/               Páginas
│   │   └── Home.jsx         Landing
│   ├── features/            Módulos por feature
│   │   └── Sections.jsx     Hero, Problem, Solution, Features, Trust, Testimonials, FinalCTA
│   ├── hooks/               Hooks personalizados
│   │   └── hooks.jsx        useRipple, useReveal
│   ├── context/             React Context (vacío)
│   ├── redux/               Store Redux (vacío)
│   ├── services/            Llamadas a API (vacío)
│   ├── utils/               Utilidades (vacío)
│   ├── App.jsx              Componente raíz
│   ├── index.css            Estilos globales + directivas Tailwind
│   └── main.jsx             Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Stack

- React 18
- Vite 5
- Tailwind CSS 3 (con paleta custom: cream, amber, brown, bg-dark)
- ESLint
- Tipografías: Fraunces + Inter (Google Fonts)

# 🎛️ Artiles Photography BackOffice

<div align="center">

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Admin](https://img.shields.io/badge/Admin-Panel-ff6b6b?style=for-the-badge&logo=shield&logoColor=white)

*Panel de administración moderno para gestionar el contenido del estudio fotográfico*

[🚀 Demo Admin](#) • [📊 Dashboard](#-características-principales) • [🛠️ Instalación](#-instalación) • [🔐 Seguridad](#️-seguridad-y-autenticación)

</div>

---

## ✨ Características Principales

- 🎛️ **Dashboard Completo** - Gestión centralizada de todo el contenido
- 📊 **Analytics Integrado** - Métricas y estadísticas en tiempo real
- 🖼️ **Gestión de Galería** - Upload, edición y organización de imágenes
- 👥 **Gestión de Clientes** - CRM básico integrado
- 💼 **Administración de Servicios** - CRUD completo de servicios fotográficos
- 📦 **Gestión de Paquetes** - Creación y edición de paquetes de fotografía
- 💬 **Moderación de Testimonios** - Aprovación y gestión de reseñas
- ⚙️ **Configuración del Sitio** - Personalización completa
- 🔐 **Sistema de Autenticación** - Login seguro con roles de usuario
- 📱 **Responsive Design** - Funciona perfectamente en todos los dispositivos

## 🏗️ Arquitectura del Panel

```
Artiles-Photography-BackOffice/
├── 📁 public/                    # Archivos estáticos
│   ├── index.html                # Template HTML principal
│   ├── favicon.ico               # Icono del admin panel
│   └── manifest.json             # PWA manifest
├── 📁 src/
│   ├── 📁 components/            # Componentes reutilizables
│   │   ├── 📁 common/            # Componentes comunes
│   │   │   ├── Header.tsx        # Header del admin
│   │   │   ├── Sidebar.tsx       # Navegación lateral
│   │   │   ├── Footer.tsx        # Pie de página
│   │   │   ├── Loading.tsx       # Componente de carga
│   │   │   └── Modal.tsx         # Modales reutilizables
│   │   ├── 📁 forms/             # Formularios
│   │   │   ├── ServiceForm.tsx   # Formulario de servicios
│   │   │   ├── PackageForm.tsx   # Formulario de paquetes
│   │   │   ├── GalleryForm.tsx   # Upload de imágenes
│   │   │   └── TestimonialForm.tsx # Formulario testimonios
│   │   ├── 📁 tables/            # Tablas de datos
│   │   │   ├── ServicesTable.tsx # Tabla de servicios
│   │   │   ├── PackagesTable.tsx # Tabla de paquetes
│   │   │   ├── GalleryTable.tsx  # Tabla de galería
│   │   │   └── TestimonialsTable.tsx # Tabla testimonios
│   │   └── 📁 charts/            # Gráficos y analytics
│   │       ├── DashboardCharts.tsx # Gráficos del dashboard
│   │       ├── StatsCards.tsx    # Tarjetas de estadísticas
│   │       └── RevenueChart.tsx  # Gráfico de ingresos
│   ├── 📁 pages/                 # Páginas del admin
│   │   ├── Dashboard.tsx         # Página principal
│   │   ├── Login.tsx             # Página de login
│   │   ├── Services.tsx          # Gestión de servicios
│   │   ├── Packages.tsx          # Gestión de paquetes
│   │   ├── Gallery.tsx           # Gestión de galería
│   │   ├── Testimonials.tsx      # Gestión de testimonios
│   │   ├── Clients.tsx           # Gestión de clientes
│   │   ├── Analytics.tsx         # Página de analytics
│   │   ├── Settings.tsx          # Configuraciones
│   │   └── Profile.tsx           # Perfil de usuario
│   ├── 📁 hooks/                 # Hooks personalizados
│   │   ├── useAuth.ts            # Hook de autenticación
│   │   ├── useApi.ts             # Hook para API calls
│   │   ├── useLocalStorage.ts    # Hook para localStorage
│   │   ├── usePagination.ts      # Hook para paginación
│   │   └── useDebounce.ts        # Hook para debounce
│   ├── 📁 services/              # Servicios y API calls
│   │   ├── api.ts                # Configuración de API
│   │   ├── authService.ts        # Servicio de autenticación
│   │   ├── photographyService.ts # API de servicios
│   │   ├── galleryService.ts     # API de galería
│   │   ├── testimonialService.ts # API de testimonios
│   │   └── analyticsService.ts   # API de analytics
│   ├── 📁 context/               # Context API
│   │   ├── AuthContext.tsx       # Contexto de autenticación
│   │   ├── ThemeContext.tsx      # Contexto de tema
│   │   └── NotificationContext.tsx # Contexto de notificaciones
│   ├── 📁 utils/                 # Utilidades
│   │   ├── constants.ts          # Constantes de la app
│   │   ├── helpers.ts            # Funciones helper
│   │   ├── validators.ts         # Validadores de formularios
│   │   ├── formatters.ts         # Formateadores de datos
│   │   └── imageUtils.ts         # Utilidades para imágenes
│   ├── 📁 types/                 # Tipos de TypeScript
│   │   ├── auth.ts               # Tipos de autenticación
│   │   ├── api.ts                # Tipos de API
│   │   ├── photography.ts        # Tipos de fotografía
│   │   └── index.ts              # Tipos generales
│   ├── 📁 styles/                # Estilos
│   │   ├── globals.css           # Estilos globales
│   │   ├── components.css        # Estilos de componentes
│   │   └── admin.css             # Estilos específicos del admin
│   ├── App.tsx                   # Componente raíz
│   ├── main.tsx                  # Punto de entrada
│   └── vite-env.d.ts             # Tipos de Vite
├── 📁 tests/                     # Tests
│   ├── 📁 components/            # Tests de componentes
│   ├── 📁 pages/                 # Tests de páginas
│   ├── 📁 hooks/                 # Tests de hooks
│   └── 📁 services/              # Tests de servicios
├── .env.example                  # Variables de entorno ejemplo
├── .gitignore                    # Archivos ignorados por Git
├── eslint.config.js              # Configuración ESLint
├── package.json                  # Dependencias y scripts
├── tailwind.config.js            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
├── tsconfig.node.json            # Config TypeScript para Node
├── vite.config.ts                # Configuración Vite
└── README.md                     # Este archivo
```

## 🛠️ Tecnologías y Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" />
<br><strong>React 18+</strong>
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" />
<br><strong>TypeScript</strong>
</td>
<td align="center" width="96">
<img src="https://vitejs.dev/logo.svg" width="48" height="48" />
<br><strong>Vite</strong>
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" />
<br><strong>Tailwind</strong>
</td>
</tr>
</table>

### 🎯 Stack Completo del BackOffice

| Categoría | Tecnologías |
|-----------|-------------|
| **⚛️ Core** | React 18, TypeScript 5, Vite 5 |
| **🎨 UI/Styling** | Tailwind CSS, Headless UI, Heroicons |
| **📊 Charts** | Chart.js, Recharts, ApexCharts |
| **📝 Forms** | React Hook Form, Yup Validation |
| **🌐 HTTP Client** | Axios, TanStack Query |
| **🔐 Auth** | JWT, React Context |
| **🧪 Testing** | Vitest, Testing Library |
| **📦 Build** | Vite, SWC, Rollup |

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
Node.js 18+
npm 9+ o yarn 1.22+ o pnpm 8+
Backend API en funcionamiento
Base de datos MySQL configurada
```

### 🔥 Inicio Rápido

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/AntRed1/Artiles-Photography-BackOffice.git
cd Artiles-Photography-BackOffice

# 2️⃣ Cambiar a la rama de desarrollo
git checkout dev

# 3️⃣ Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# 4️⃣ Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# 5️⃣ Ejecutar en modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev
```

🎉 **¡Listo!** El panel de administración estará disponible en [http://localhost:5173](http://localhost:5173)

### ⚙️ Variables de Entorno

```bash
# .env.local
VITE_API_URL=http://localhost:8080/api
VITE_APP_TITLE="Artiles Photography Admin"
VITE_JWT_SECRET=your_super_secret_jwt_key
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 📋 Scripts Disponibles

```bash
# 🔥 Desarrollo
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción optimizado
npm run preview      # Vista previa del build

# 🧹 Calidad de Código
npm run lint         # Verificar con ESLint
npm run lint:fix     # Arreglar errores automáticamente
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatear código con Prettier

# 🧪 Testing
npm run test         # Ejecutar tests con Vitest
npm run test:watch   # Tests en modo watch
npm run test:ui      # Interfaz de testing
npm run coverage     # Reporte de cobertura

# 📊 Análisis
npm run analyze      # Analizar tamaño del bundle
npm run lighthouse   # Auditoría de performance
```

## 🎛️ Funcionalidades del Panel

### 📊 Dashboard Principal

```typescript
// Métricas principales mostradas
interface DashboardStats {
  totalServices: number;
  totalPackages: number;
  totalTestimonials: number;
  monthlyRevenue: number;
  activeClients: number;
  galleryImages: number;
  conversionRate: number;
  averageRating: number;
}
```

**Características del Dashboard:**

- 📈 **Gráficos en tiempo real** de ingresos y conversiones
- 📊 **KPIs principales** con comparaciones mensuales
- 📅 **Calendario de eventos** y sesiones fotográficas
- 🔔 **Notificaciones** de nuevos testimonios y contactos
- ⚡ **Acciones rápidas** para tareas frecuentes

### 🖼️ Gestión de Galería

- 📤 **Upload múltiple** de imágenes con drag & drop
- 🏷️ **Categorización** automática y manual
- ✂️ **Editor de imágenes** integrado
- 🗂️ **Organización** por álbumes y eventos
- 🔍 **Búsqueda avanzada** por metadatos
- 📱 **Optimización automática** para web y móviles

### 💼 Gestión de Servicios

```typescript
interface PhotographyService {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  category: ServiceCategory;
  features: string[];
  featured: boolean;
  active: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 📦 Gestión de Paquetes

```typescript
interface PhotographyPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  services: ServiceId[];
  popular: boolean;
  limitedTime: boolean;
  validUntil?: Date;
  maxBookings?: number;
  currentBookings: number;
}
```

### 👥 Gestión de Clientes (CRM Básico)

- 📋 **Lista de clientes** con historial completo
- 📞 **Información de contacto** actualizable
- 📅 **Historial de servicios** contratados
- 💰 **Seguimiento de pagos** y facturas
- ⭐ **Nivel de satisfacción** basado en testimonios
- 📧 **Comunicación** directa integrada

## 🔐 Seguridad y Autenticación

### 🛡️ Características de Seguridad

- 🔑 **Autenticación JWT** con refresh tokens
- 👤 **Sistema de roles** (Admin, Editor, Viewer)
- 🚫 **Protección de rutas** basada en permisos
- 🔒 **Validación del lado del cliente** y servidor
- 📝 **Logs de actividad** para auditoría
- ⏱️ **Sesiones con timeout** automático

### 👮‍♂️ Roles y Permisos

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

| Rol | Dashboard | Servicios | Galería | Clientes | Config |
|-----|----------|-----------|---------|----------|--------|
| **Super Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Read/Update | ❌ |
| **Editor** | ✅ View | ✅ CRUD | ✅ CRUD | ✅ Read | ❌ |
| **Viewer** | ✅ View | ✅ Read | ✅ Read | ✅ Read | ❌ |

## 📊 Analytics y Reportes

### 📈 Métricas Disponibles

- **Tráfico del sitio web** - Visitantes únicos, páginas vistas
- **Conversiones** - Formularios completados, consultas
- **Servicios más solicitados** - Por categoría y temporada
- **Ingresos** - Mensuales, anuales, por servicio
- **Satisfacción del cliente** - Rating promedio, NPS
- **Performance** - Tiempo de carga, bounce rate

### 📊 Dashboards Personalizables

```typescript
interface CustomDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: GridLayout;
  user: UserId;
  shared: boolean;
}

interface DashboardWidget {
  type: 'chart' | 'metric' | 'table' | 'calendar';
  title: string;
  dataSource: string;
  configuration: WidgetConfig;
  position: GridPosition;
}
```

## 🎨 Personalización y Temas

### 🌙 Modo Oscuro/Claro

```typescript
// Configuración de temas
const themes = {
  light: {
    primary: '#1a202c',
    secondary: '#2d3748',
    background: '#ffffff',
    surface: '#f7fafc',
    text: '#2d3748',
    textSecondary: '#718096',
  },
  dark: {
    primary: '#e53e3e',
    secondary: '#fc8181',
    background: '#1a202c',
    surface: '#2d3748',
    text: '#f7fafc',
    textSecondary: '#cbd5e0',
  }
};
```

### 🎨 Personalización del Brand

- 🎨 **Colores de marca** configurables
- 📷 **Logo personalizable** en header y login
- 🖼️ **Imágenes de fondo** personalizables
- 📱 **Favicon** y manifest personalizables
- ✉️ **Templates de email** con branding

## 🧪 Testing y Calidad

### 🔍 Estrategia de Testing

```bash
# Cobertura de tests objetivo
- Unit Tests: 90%+
- Integration Tests: 80%+
- E2E Tests: 70%+
```

### 📋 Tipos de Tests

- **Unit Tests** - Componentes individuales
- **Integration Tests** - Flujos de usuario
- **E2E Tests** - Casos de uso completos
- **Visual Regression** - Consistencia de UI
- **Performance Tests** - Tiempo de carga

### 🧪 Herramientas de Testing

```typescript
// Configuración de testing
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 🚀 Deployment y Producción

### 📦 Build de Producción

```bash
# Build optimizado para producción
npm run build

# Análisis del bundle
npm run analyze

# Preview del build
npm run preview
```

### 🌐 Opciones de Deploy

<details>
<summary><strong>🔥 Firebase Hosting</strong></summary>

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

</details>

<details>
<summary><strong>▲ Vercel</strong></summary>

```bash
npm install -g vercel
vercel --prod
```

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_JWT_SECRET": "@jwt-secret"
  }
}
```

</details>

<details>
<summary><strong>📡 Netlify</strong></summary>

```bash
npm run build
# Deploy via Netlify CLI o drag & drop
```

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

</details>

<details>
<summary><strong>🐳 Docker</strong></summary>

```dockerfile
# Multi-stage build para optimización
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build y deploy con Docker
docker build -t artiles-backoffice .
docker run -p 80:80 artiles-backoffice
```

</details>

### 🔒 Variables de Entorno en Producción

```bash
# Production environment variables
VITE_API_URL=https://api.artilesphoto.com
VITE_JWT_SECRET=your_super_secure_production_secret
VITE_CLOUDINARY_CLOUD_NAME=artiles-photography
VITE_GOOGLE_ANALYTICS_ID=GA_PRODUCTION_ID
VITE_ENVIRONMENT=production
```

## 🔧 Configuración Avanzada

### ⚡ Optimizaciones de Performance

```typescript
// vite.config.ts optimizations
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'recharts'],
          forms: ['react-hook-form', 'yup'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
});
```

### 📱 PWA Configuration

```typescript
// PWA manifest
{
  "name": "Artiles Photography Admin",
  "short_name": "Artiles Admin",
  "description": "Panel de administración para Artiles Photography",
  "theme_color": "#1a202c",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🤝 Contribuir al Proyecto

### 🔄 Proceso de Contribución

1. 🍴 **Fork** el repositorio
2. 🌱 **Crea** una rama feature

   ```bash
   git checkout -b feature/admin-improvement
   ```

3. 💾 **Commit** con convenciones

   ```bash
   git commit -m 'feat(admin): add new analytics dashboard'
   ```

4. 🧪 **Ejecuta tests**

   ```bash
   npm run test && npm run type-check
   ```

5. 📤 **Push** a tu rama

   ```bash
   git push origin feature/admin-improvement
   ```

6. 🔄 **Abre** un Pull Request

### 📋 Guías de Contribución

- ✅ **Seguir convenciones** de TypeScript y React
- 🧪 **Añadir tests** para nuevas funcionalidades
- 📝 **Documentar** componentes y funciones
- 🎨 **Mantener consistencia** en el diseño
- 🔐 **Considerar seguridad** en cambios de auth
- 📱 **Verificar responsividad** en todos los dispositivos

### 🎯 Conventional Commits

```bash
feat(scope): nueva funcionalidad
fix(scope): corrección de bug
docs: cambios en documentación
style: cambios de formato/estilo
refactor: refactorización de código
test: añadir o modificar tests
chore: tareas de mantenimiento
security: mejoras de seguridad
perf: mejoras de performance
```

## 📈 Roadmap del BackOffice

### 🚀 Próximas Funcionalidades

#### 🎯 Corto Plazo (Q1 2024)

- [ ] 📊 **Dashboard personalizable** - Widgets drag & drop
- [ ] 🔔 **Sistema de notificaciones** push
- [ ] 📧 **Integración email marketing** - Mailchimp/SendGrid
- [ ] 🗓️ **Calendario de citas** integrado
- [ ] 📱 **App móvil nativa** - React Native

#### 🎯 Mediano Plazo (Q2-Q3 2024)

- [ ] 🤖 **IA para categorización** automática de imágenes
- [ ] 💰 **Sistema de facturación** completo
- [ ] 📊 **Reportes avanzados** exportables
- [ ] 🌍 **Multi-idioma** (ES/EN/FR)
- [ ] 👥 **Gestión de equipo** y asignaciones
- [ ] 📦 **Inventario de equipos** fotográficos

#### 🎯 Largo Plazo (Q4 2024+)

- [ ] 🎨 **Editor de imágenes** avanzado integrado
- [ ] 🔄 **Integración con CRMs** externos
- [ ] 📈 **Machine Learning** para predicciones
- [ ] 🌐 **API pública** para integraciones
- [ ] 🎥 **Gestión de videos** y streaming
- [ ] 🏢 **Multi-tenant** para múltiples estudios

### 🔧 Mejoras Técnicas

- [ ] ⚡ **Migración a Next.js 14** con App Router
- [ ] 🗄️ **State Management** con Zustand/Redux Toolkit
- [ ] 🧪 **Testing E2E** con Playwright
- [ ] 📦 **Micro-frontends** con Module Federation
- [ ] 🚀 **Edge Computing** deployment
- [ ] 🔍 **Elasticsearch** para búsqueda avanzada

## 🛡️ Seguridad y Compliance

### 🔒 Medidas de Seguridad

- **🔐 Autenticación multifactor** (2FA) opcional
- **🛡️ Headers de seguridad** (CSP, HSTS, etc.)
- **🔍 Sanitización** de inputs y outputs
- **📝 Logs de auditoría** detallados
- **🔄 Rotación de tokens** automática
- **⏰ Políticas de sesión** configurables

### 📋 Compliance y Privacidad

- **🇪🇺 GDPR Compliance** - Gestión de datos personales
- **🛡️ SOC 2** - Controles de seguridad
- **📊 Logs de acceso** para auditoría
- **🗑️ Derecho al olvido** - Eliminación de datos
- **📧 Políticas de email** - Opt-out automático

## 📞 Soporte y Documentación

### 🆘 Canales de Soporte

- 📧 **Email**: [Crear issue](https://github.com/AntRed1/Artiles-Photography-BackOffice/issues)
- 🐛 **Bug Reports**: [Reportar bug](https://github.com/AntRed1/Artiles-Photography-BackOffice/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Solicitar feature](https://github.com/AntRed1/Artiles-Photography-BackOffice/issues/new?template=feature_request.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AntRed1/Artiles-Photography-BackOffice/discussions)

### 📚 Documentación Adicional

- 🎓 **Guía de Usuario** - [Wiki del proyecto](https://github.com/AntRed1/Artiles-Photography-BackOffice/wiki)
- 🔧 **API Documentation** - [Postman Collection](https://documenter.getpostman.com/view/artiles-api)
- 🎨 **Design System** - [Storybook Components](https://storybook.artilesphoto.com)
- 📱 **Mobile Guidelines** - [Responsive Design Guide](https://github.com/AntRed1/Artiles-Photography-BackOffice/blob/main/docs/mobile-guide.md)

## 🔄 Integración con Backend

### 🌐 Conexión con API

```typescript
// Configuración de API client
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 📡 Endpoints Principales

| Funcionalidad | Método | Endpoint | Descripción |
|---------------|--------|----------|-------------|
| **🔐 Auth** | POST | `/auth/login` | Iniciar sesión |
| **👤 User** | GET | `/auth/profile` | Perfil del usuario |
| **📊 Dashboard** | GET | `/admin/stats` | Estadísticas generales |
| **📷 Services** | GET/POST/PUT/DELETE | `/admin/services` | CRUD servicios |
| **📦 Packages** | GET/POST/PUT/DELETE | `/admin/packages` | CRUD paquetes |
| **🖼️ Gallery** | GET/POST/PUT/DELETE | `/admin/gallery` | CRUD galería |
| **⭐ Testimonials** | GET/POST/PUT/DELETE | `/admin/testimonials` | CRUD testimonios |
| **⚙️ Config** | GET/PUT | `/admin/configuration` | Configuraciones |

## 📊 Monitoreo y Analytics

### 📈 Herramientas de Monitoreo

```typescript
// Analytics configuration
const analyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.VITE_GOOGLE_ANALYTICS_ID,
    enableEcommerce: true,
    enableEnhancedMeasurement: true,
  },
  hotjar: {
    hjid: process.env.VITE_HOTJAR_ID,
    hjsv: 6,
  },
  mixpanel: {
    token: process.env.VITE_MIXPANEL_TOKEN,
    trackPageViews: true,
  },
};
```

### 📊 Métricas Clave (KPIs)

- **👥 Usuarios activos** - Diarios, semanales, mensuales
- **⏱️ Tiempo de sesión** - Duración promedio en el panel
- **🎯 Tasa de conversión** - Leads generados vs cerrados
- **💰 Revenue tracking** - Ingresos por período
- **📱 Device usage** - Desktop vs Mobile vs Tablet
- **🔄 Feature adoption** - Uso de nuevas funcionalidades

## 🏆 Mejores Prácticas

### 🎯 Desarrollo

```typescript
// Estructura de componentes recomendada
interface ComponentProps {
  // Props siempre tipadas
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

// Componente con error boundaries
const SafeComponent: React.FC<ComponentProps> = ({
  children,
  error,
  loading,
  className = '',
}) => {
  if (error) return <ErrorFallback error={error} />;
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className={`safe-component ${className}`}>
      {children}
    </div>
  );
};
```

### 🎨 UI/UX Guidelines

- **📱 Mobile First** - Diseñar primero para móviles
- **♿ Accessibility** - WCAG 2.1 AA compliance
- **⚡ Performance** - Core Web Vitals optimizados
- **🎨 Consistency** - Design system coherente
- **🔄 Feedback** - Estados de loading y error claros
- **💫 Animations** - Transiciones suaves y significativas

### 🔐 Seguridad en Frontend

```typescript
// Validación de inputs
import * as yup from 'yup';

const serviceSchema = yup.object({
  name: yup.string()
    .required('Nombre es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  price: yup.number()
    .required('Precio es requerido')
    .positive('Debe ser un número positivo')
    .max(999999, 'Precio máximo excedido'),
  description: yup.string()
    .required('Descripción es requerida')
    .min(10, 'Descripción muy corta'),
});
```

## 🎓 Recursos de Aprendizaje

### 📖 Documentación Oficial

- **⚛️ React**: [https://react.dev](https://react.dev)
- **📘 TypeScript**: [https://typescriptlang.org](https://typescriptlang.org)
- **🎨 Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **⚡ Vite**: [https://vitejs.dev](https://vitejs.dev)

### 🎥 Tutoriales Recomendados

- **React Admin Dashboards** - Construcción de paneles modernos
- **TypeScript Best Practices** - Patrones avanzados
- **Tailwind CSS Mastery** - Diseño responsive avanzado
- **Vite Configuration** - Optimización y plugins

## 🐛 Solución de Problemas

### ❗ Problemas Comunes

<details>
<summary><strong>🔧 Error de Compilación TypeScript</strong></summary>

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versiones de TypeScript
npm run type-check
```

</details>

<details>
<summary><strong>🌐 Problemas de CORS</strong></summary>

```typescript
// vite.config.ts - Proxy para desarrollo
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

</details>

<details>
<summary><strong>📦 Build Failures</strong></summary>

```bash
# Limpiar build cache
npm run clean
rm -rf dist

# Build con logs detallados
npm run build -- --mode development
```

</details>

<details>
<summary><strong>🔐 Problemas de Autenticación</strong></summary>

```typescript
// Verificar token en localStorage
const token = localStorage.getItem('authToken');
if (!token || isTokenExpired(token)) {
  // Redirect to login
  navigate('/login');
}
```

</details>

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 Artiles Photography Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Agradecimientos y Créditos

### 👏 Agradecimientos Especiales

- 🎨 **UI/UX Designers** - Por las interfaces inspiradoras
- 👨‍💻 **Open Source Community** - Por las herramientas increíbles
- 📷 **Photography Industry** - Por el feedback valioso
- 🧪 **Beta Testers** - Por encontrar y reportar bugs
- ⚡ **Vite Team** - Por la herramienta de desarrollo fantástica
- ⚛️ **React Team** - Por el framework que hace todo posible

### 🛠️ Tecnologías y Librerías

- **React & Ecosystem** - La base de todo
- **TypeScript** - Por la seguridad de tipos
- **Tailwind CSS** - Por el sistema de diseño flexible
- **Chart.js & Recharts** - Por las visualizaciones
- **React Hook Form** - Por la gestión de formularios
- **Axios & TanStack Query** - Por la gestión de estado del servidor
- **Lucide React & Heroicons** - Por los iconos hermosos

---

<div align="center">

**🎛️ Panel de Administración Artiles Photography 📸**

*Gestionando la creatividad con tecnología moderna*

⭐ ¡Dale una estrella si te gusta el proyecto! ⭐

[![GitHub stars](https://img.shields.io/github/stars/AntRed1/Artiles-Photography-BackOffice?style=social)](https://github.com/AntRed1/Artiles-Photography-BackOffice/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AntRed1/Artiles-Photography-BackOffice?style=social)](https://github.com/AntRed1/Artiles-Photography-BackOffice/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/AntRed1/Artiles-Photography-BackOffice?style=social)](https://github.com/AntRed1/Artiles-Photography-BackOffice/watchers)

**[🌐 Sitio Web](https://artilesphoto.com) • [📧 Contacto](mailto:admin@artilesphoto.com) • [📱 Demo](https://admin.artilesphoto.com)**

</div>

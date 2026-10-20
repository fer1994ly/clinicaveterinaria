# Sienra Gastos — control de gastos y presupuestos

Aplicación web mobile-first para la **Clínica Veterinaria Sienra** (Uruguay). Resuelve un problema concreto: la clínica llevaba los gastos de memoria y se enteraba de un exceso (por ejemplo, un mes con más cirugías) recién al cierre del mes, cuando ya no había nada que ajustar. Esta aplicación muestra, en cualquier momento del mes, cuánto se gastó por categoría frente a su presupuesto mensual (en pesos uruguayos, UYU), y avisa antes del cierre: amarillo desde el 80 % del presupuesto y rojo cuando se supera.

Todo funciona en el navegador: no hay backend ni servicios externos (salvo la carga de tipografías desde Google Fonts). Los datos se guardan en `localStorage`.

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Demo: datos de ejemplo](#demo-datos-de-ejemplo)
- [Requisitos](#requisitos)
- [Instalación y uso local](#instalación-y-uso-local)
- [Scripts disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Arquitectura](#arquitectura)
- [Modelo de dominio](#modelo-de-dominio)
- [Persistencia](#persistencia)
- [Integración con backend (para Kodarvia)](#integración-con-backend-para-kodarvia)
- [Identidad visual](#identidad-visual)
- [Rendimiento](#rendimiento)
- [Despliegue en Netlify](#despliegue-en-netlify)
- [Calidad de código](#calidad-de-código)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Licencia y créditos](#licencia-y-créditos)

## Funcionalidades

- **Resumen mensual** con el total general del mes arriba y una tarjeta por categoría: presupuesto, gastado y barra de progreso. Amarillo desde el 80 %, rojo cuando se supera el 100 %, con alertas visibles.
- **Alta de gastos** con categoría, monto (mayor a cero) y fecha obligatorios; la descripción es opcional. El formulario no se envía si falta un dato requerido.
- **Edición y eliminación** de gastos; eliminar pide confirmación dentro de la aplicación. Los totales se recalculan al instante, sin recargar.
- **Historial** con filtros combinables por categoría y rango de fechas, y búsqueda por texto en la descripción.
- **Reinicio mensual automático**: los totales se calculan por mes calendario de cada gasto; el historial nunca se borra y los presupuestos no cambian con el mes.
- **Mes anterior** en modo solo lectura, para comparar con el mes en curso.
- **Clínica** (`/clinica`): qué hace la clínica, dirección, teléfono (enlace para llamar), enlace a Google Maps y a Facebook. Solo enlaces externos, sin mapas incrustados (la CSP no cambia).
- **Panel de administración** protegido por clave, único lugar donde se editan los presupuestos. Incluye "Restablecer datos de ejemplo".
- **Persistencia** entre recargas y reaperturas de pestaña.
- **Mobile-first**: sin elementos recortados ni botones ocultos en teléfonos.

## Demo: datos de ejemplo

Cuando el almacenamiento está vacío (o corrupto), la aplicación genera datos de ejemplo **relativos a la fecha actual**, de modo que la demostración siempre funciona:

- **Mes en curso** (17 gastos, ubicados en días hasta hoy): *Medicamentos y farmacia* supera el presupuesto (aprox. 112 %, en rojo) e *Insumos clínicos* queda entre el 80 % y el 100 % (aprox. 87 %, en amarillo). La historia: este mes hubo más cirugías.
- **Mes anterior** (13 gastos): un mes tranquilo y dentro de presupuesto, para la vista de comparación.

**Clave de administración de la demo:** `sienra2026`.

Para cambiarla o quitar la pista, editar `src/features/admin/domain/auth.ts`:

- `ADMIN_PASSWORD`: la clave (constante en texto plano; solo apta para demo).
- `SHOW_DEMO_PASSWORD_HINT`: poner `false` para que la pantalla de acceso deje de mostrar "Clave de demostración: …".

La sesión desbloqueada se guarda en `sessionStorage` y termina al cerrar la pestaña.

## Requisitos

- Node.js 20 o superior (`engines` en `package.json`). El despliegue en Netlify usa Node 22 (`.nvmrc` y `netlify.toml`).
- npm (incluido con Node.js).

## Instalación y uso local

```bash
npm install
npm run dev        # servidor de desarrollo (Vite)
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build en http://localhost:4173
```

## Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite. |
| `npm run build` | Verifica tipos (`tsc --noEmit`) y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve `dist/` en `http://localhost:4173` (puerto estricto). |
| `npm run typecheck` | Verifica tipos con TypeScript, sin emitir archivos. |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto (incluye la regla `no-console`). |
| `npm test` | Vitest en modo watch. Usar `npm test -- --run` para una sola ejecución. |
| `npm run test:e2e` | Pruebas E2E con Playwright (construye y levanta `preview` automáticamente). |
| `npm run test:e2e:remote` | Las mismas pruebas E2E contra el sitio desplegado (`https://clinicaveterinariagastos.netlify.app`), sin levantar servidor local, más `e2e/deployment.spec.ts`. |
| `npm run check:bundle` | Falla si el JavaScript de producción supera 150 KB gzip. Requiere `npm run build` previo. |

## Testing

El proyecto se desarrolló con **TDD estricto** (RED → GREEN → REFACTOR), con forma de pirámide: muchas pruebas unitarias rápidas sobre el dominio y la aplicación, un grupo menor de pruebas de integración de la interfaz y un conjunto reducido de escenarios E2E de aceptación.

| Nivel | Herramienta | Dónde viven | Cobertura |
| --- | --- | --- | --- |
| Unitarias | Vitest | `src/**/*.test.ts` junto al código | Reglas de dominio (estado de presupuesto, validación, dinero, meses), casos de uso, repositorios y semilla. |
| Integración | Vitest + Testing Library (jsdom) | `src/app/*.integration.test.tsx` | Pantallas completas con almacenamiento en memoria y reloj fijo: resumen, gastos, mes anterior, administración. |
| E2E | Playwright | `e2e/` (`acceptance.spec.ts`, `layout.spec.ts`, `deployment.spec.ts`) | Criterios de aceptación, persistencia tras recargar y ausencia de desbordamiento horizontal en móvil; `deployment.spec.ts` solo corre contra el sitio desplegado. |

**Cantidades actuales:** Vitest, 23 archivos de prueba con 209 pruebas; Playwright, 20 escenarios locales en 3 proyectos (60 pruebas) y 9 verificaciones adicionales de despliegue (27 pruebas, solo en modo remoto).

```bash
npm test -- --run                          # unitarias + integración
npx playwright install chromium webkit     # una sola vez: descarga los navegadores
npm run test:e2e                           # E2E en los tres proyectos
```

Proyectos de Playwright (`playwright.config.ts`):

- `desktop-chromium`: Desktop Chrome.
- `mobile-android`: emulación de Pixel 7 (Chromium).
- `mobile-ios`: emulación de iPhone 14 sobre WebKit real.

Las pruebas E2E congelan el reloj en **martes 20 de octubre de 2026** (`NOW` en `e2e/fixtures.ts`), por lo que los datos de ejemplo y los totales son deterministas. La prueba de rendimiento y `deployment.spec.ts` no usan reloj congelado: miden con el propio navegador (`performance.now()` y *navigation timing*).

### E2E contra el sitio desplegado

```bash
npm run test:e2e:remote                     # usa https://clinicaveterinariagastos.netlify.app
E2E_BASE_URL=https://otro-sitio npm run test:e2e:remote   # otro destino
```

- Si `E2E_BASE_URL` está definida, `playwright.config.ts` la usa como `baseURL` y **no levanta** el servidor local. El script `scripts/e2e-remote.mjs` la define de forma multiplataforma (sin `cross-env`) y reenvía el código de salida; se pueden pasar argumentos de Playwright (`npm run test:e2e:remote -- --project=desktop-chromium`).
- En modo remoto las tipografías de Google Fonts **no se bloquean** (forman parte de producción) y cada prueba usa un contexto limpio, por lo que `localStorage` arranca vacío y se generan los datos de ejemplo.
- `e2e/deployment.spec.ts` verifica en el despliegue real: cabeceras (CSP, `X-Frame-Options: DENY`, `nosniff`), caché `immutable` de `/assets/*`, enlaces directos y recarga de `/gastos`, `/gastos/nuevo`, `/mes-anterior` y `/admin`, ausencia de errores de consola y de violaciones de CSP, carga real de Nunito e Inter y carga completa en menos de 3 s.
- Netlify inyecta en los sitios publicados una insignia propia (`/.netlify/scripts/hud`) que construye un iframe con script en línea y la CSP del sitio la bloquea (correctamente). Esa prueba la reemplaza por un script vacío para medir solo el código propio.
- Tras publicar cambios, esperar a que Netlify termine el despliegue antes de correr la suite remota; si no, se prueba la versión anterior.

## Arquitectura

**DDD con cortes verticales (vertical slicing)**: cada capacidad del negocio es un *slice* en `src/features/<slice>/` con sus propias capas `domain`, `application`, `infrastructure` y `ui`. Lo transversal vive en un núcleo compartido (`src/shared`) y la composición se hace en `src/app`.

```
src/
├── app/                      # raíz de composición
│   ├── container.ts          # único lugar donde se eligen adaptadores concretos
│   ├── App.tsx, AppProviders.tsx, AppRoutes.tsx, AppShell.tsx
│   ├── DashboardPage.tsx
│   └── *.integration.test.tsx
├── features/
│   ├── budgets/              # categorías, estado del presupuesto, resumen mensual
│   │   ├── domain/           # category, budgetStatus, categorySummary, ports, validateBudget
│   │   ├── application/      # getMonthlyOverview, updateBudget
│   │   ├── infrastructure/   # localBudgetRepository
│   │   └── ui/               # CategoryCard, CategoryGrid, MonthlyTotalCard
│   ├── expenses/             # alta, edición, baja, historial, semilla
│   │   ├── domain/           # expense, validateExpense, searchText, ports
│   │   ├── application/      # addExpense, editExpense, deleteExpense, queryHistory
│   │   ├── infrastructure/   # localExpenseRepository, seed
│   │   └── ui/               # ExpenseForm, HistoryPage, ExpenseList, HistoryFilters, ...
│   ├── monthly-comparison/   # vista de solo lectura del mes anterior
│   │   ├── application/      # compareMonths
│   │   └── ui/               # PreviousMonthPage, ComparisonSection
│   ├── clinic-info/          # datos de contacto de la clínica
│   │   ├── domain/           # clinicInfo
│   │   └── ui/               # ClinicInfoPage
│   └── admin/                # clave, sesión y edición de presupuestos
│       ├── domain/           # auth, ports
│       ├── application/      # adminAccess
│       ├── infrastructure/   # storageAdminSession
│       └── ui/               # AdminLogin, AdminPage, BudgetEditor
├── shared/                   # núcleo compartido
│   ├── domain/               # money, yearMonth, clock (puerto), storage (puerto), result, id
│   ├── infrastructure/       # localStorage/sessionStorage/memoria, SystemClock, FixedClock, uuid
│   └── ui/                   # Button, Card, Dialog, ProgressBar, formatters, icons
└── test-utils/               # renderApp (helpers de prueba)
```

**Regla de dependencias:** `domain` (TypeScript puro, sin React ni almacenamiento) ← `application` (casos de uso, reciben repositorios y reloj por parámetro) ← `infrastructure` y `ui` ← `app` (raíz de composición, el único que conoce los adaptadores concretos). El dominio nunca importa de capas externas.

**Puertos y adaptadores:**

- `KeyValueStorage` (`src/shared/domain/storage.ts`): puerto de almacenamiento clave/valor; adaptadores de `localStorage`, `sessionStorage` y en memoria.
- `Clock` (`src/shared/domain/clock.ts`): puerto del reloj; `SystemClock` en producción y `FixedClock` en pruebas.
- Puertos de repositorio por slice en `domain/ports.ts` (`ExpenseRepository`, `BudgetRepository`, `AdminSession`).

```mermaid
flowchart LR
  app["app (composition root)"] --> expenses
  app --> budgets
  app --> admin
  app --> comparison["monthly-comparison"]
  expenses --> budgets
  comparison --> budgets
  comparison --> expenses
  admin --> budgets
  expenses --> shared
  budgets --> shared
  admin --> shared
  comparison --> shared
```

## Modelo de dominio

**Categorías y presupuestos mensuales por defecto** (`src/features/budgets/domain/category.ts`):

| Id | Categoría | Presupuesto (UYU) |
| --- | --- | --- |
| `insumos-clinicos` | Insumos clínicos | 90.000 |
| `medicamentos-farmacia` | Medicamentos y farmacia | 120.000 |
| `servicios` | Servicios (luz, agua, gas) | 35.000 |
| `personal` | Personal | 150.000 |

**Estado del presupuesto** (`budgetStatus.ts`, aritmética entera para que los límites sean exactos):

| Estado | Condición | Color |
| --- | --- | --- |
| `ok` | gastado < 80 % | verde |
| `warning` | 80 % ≤ gastado ≤ 100 % | amarillo |
| `exceeded` | gastado > 100 % | rojo |

**Validación de un gasto** (`validateExpense.ts`):

- Categoría: debe ser una de las cuatro existentes.
- Monto: entero positivo (mayor a cero).
- Fecha: obligatoria y real (formato `AAAA-MM-DD`; se rechazan fechas inexistentes como 31 de febrero).
- Descripción: opcional, hasta 140 caracteres.

**Reinicio mensual:** nunca se borra ni se reinicia nada. Los totales mensuales se derivan de los gastos cuya fecha cae en el mes calendario actual, según el `Clock` inyectado. El día 1 el resumen vuelve a cero, mientras los gastos anteriores permanecen en el historial y alimentan la vista "Mes anterior". Los presupuestos no dependen del mes.

## Persistencia

Todo se guarda en el navegador, con claves versionadas (`v1`):

| Almacenamiento | Clave | Contenido |
| --- | --- | --- |
| `localStorage` | `sienra.v1.expenses` | Arreglo JSON de gastos. |
| `localStorage` | `sienra.v1.budgets` | Objeto JSON con el presupuesto por categoría. |
| `sessionStorage` | `sienra.v1.admin-unlocked` | Marca de administración desbloqueada (dura mientras la pestaña esté abierta). |

- **Versionado:** el sufijo `v1` en la clave permite introducir un formato nuevo (`v2`) sin pisar datos existentes.
- **Datos corruptos (presupuestos):** cada categoría se valida por separado; un valor inválido vuelve al presupuesto por defecto de esa categoría y los valores válidos se conservan.
- **Datos corruptos (gastos) y cuarentena:** los registros mal formados no se muestran, pero **nunca se destruyen**: antes de la siguiente escritura se copian a la clave `sienra.v1.expenses.quarantine` (si todo el JSON es ilegible, se guarda el texto original). Se pueden inspeccionar o recuperar a mano desde las herramientas del navegador.
- **Errores al guardar:** si el navegador rechaza una escritura (cuota llena, modo privado o almacenamiento bloqueado), el adaptador lanza `StorageWriteError`; los repositorios la capturan, conservan los datos en memoria (se guardan con la siguiente escritura exitosa) y la interfaz muestra un aviso no bloqueante: «No se pudo guardar. Verifique el espacio disponible del navegador.»

## Integración con backend (para Kodarvia)

La aplicación está preparada para cambiar `localStorage` por una API:

- **Puerto de almacenamiento:** `src/shared/domain/storage.ts` (`KeyValueStorage`); adaptadores en `src/shared/infrastructure/`.
- **Repositorios:** `LocalExpenseRepository` y `LocalBudgetRepository` implementan los puertos declarados en `domain/ports.ts` de cada slice. Para integrar un backend, implementar esos puertos contra la API y cambiarlos en `src/app/container.ts`, el único lugar donde se eligen los adaptadores concretos.
- **Sincronía:** hoy los repositorios son **síncronos**. Un backend real requiere que los puertos y los hooks de `src/app/AppProviders.tsx` pasen a ser asíncronos (carga, errores y estados de espera).
- **Autenticación:** la verificación de la clave está en `src/features/admin/domain/auth.ts` (`ADMIN_PASSWORD`, `checkAdminPassword`) y es solo para demo. Debe trasladarse al servidor (autenticación real, sesión o token y autorización de la edición de presupuestos), y se debe eliminar `SHOW_DEMO_PASSWORD_HINT`.

## Identidad visual

| Color | Hex | Uso |
| --- | --- | --- |
| Azul clínica | `#7FC7D9` | Color de marca y `theme-color` (variantes `#E8F5F9` de fondo y `#2F7F94`). |
| Blanco | `#FFFFFF` | Tarjetas y superficies. |
| Verde salud | `#6FAE7B` | Acción principal y estado correcto (variantes `#3E7A4B`, `#E9F4EB`). |
| Tinta | `#1B2A2E` | Texto principal (variante suave `#4A5B60`). |
| Ámbar | `#E0A526` | Estado de advertencia (variantes `#7A5800`, `#FFF6DD`). |
| Rojo | `#D64545` | Estado excedido (variantes `#A62B2B`, `#FDECEC`). |

- **Tipografía:** Nunito (700/800) para títulos e Inter (400/500/600) para el cuerpo, cargadas desde Google Fonts, con `system-ui` como respaldo.
- **Accesibilidad:** contraste AA; texto en color tinta sobre el botón verde de acción principal; objetivos táctiles de al menos 44 px; diseño mobile-first; sin imágenes de stock.

## Rendimiento

- **Presupuesto de tamaño:** el JavaScript de producción (carga inicial más chunks diferidos) no debe superar **150 KB gzip**. Hoy ronda los 66 KB.
- **Rutas con carga diferida:** "Mes anterior", "Clínica" y "Admin" se cargan bajo demanda (`React.lazy`) para mantener liviana la primera carga.
- **Verificación:** `npm run build && npm run check:bundle`; el script falla si se supera el límite.

## Despliegue en Netlify

La configuración está en `netlify.toml` y `.nvmrc` (Node 22); no se necesita CLI de Netlify.

1. En Netlify: **Add new site → Import an existing project** y conectar el repositorio de GitHub `fer1994ly/clinicaveterinaria`.
2. Rama de producción: `main`.
3. Los ajustes de build se leen automáticamente de `netlify.toml`: comando `npm run build`, directorio de publicación `dist`, `NODE_VERSION = "22"`.
4. Desplegar. Cada pull request genera un **Deploy Preview** (si está habilitado en el sitio).

Qué configura `netlify.toml`:

- **Redirección SPA** (`/*` → `/index.html`, estado 200): la aplicación usa `BrowserRouter`; sin esta regla, abrir o recargar rutas como `/gastos` o `/admin` daría 404.
- **Caché:** `/assets/*` (archivos con hash) con `public, max-age=31536000, immutable`; `/index.html` con `no-cache` para que cada despliegue nuevo se recoja de inmediato.
- **Cabeceras de seguridad** en `/*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` (cámara, micrófono y geolocalización deshabilitados) y una `Content-Security-Policy` que permite solo recursos propios, más estilos de `fonts.googleapis.com` y tipografías de `fonts.gstatic.com`. Si se agrega otro recurso externo, hay que ampliar la política.

**Verificación del despliegue:** `npm run test:e2e:remote` ejecuta la suite E2E y `e2e/deployment.spec.ts` contra `https://clinicaveterinariagastos.netlify.app` (cabeceras, caché, enlaces directos, CSP, tipografías y tiempo de carga). Ver [E2E contra el sitio desplegado](#e2e-contra-el-sitio-desplegado).

**Alternativa manual:** ejecutar `npm run build` y arrastrar la carpeta `dist/` a la sección *Deploys* del sitio en Netlify. Un despliegue manual de `dist/` no incluye `netlify.toml`, por lo que la redirección SPA y las cabeceras no se aplicarían; para mantenerlas, el sitio debe estar conectado al repositorio.

## Calidad de código

- **Lint:** `npm run lint` (ESLint con TypeScript y reglas de React Hooks). La regla `no-console` está en `error` para todos los archivos (código, pruebas E2E, scripts y configuraciones): no se admite ningún `console.*`; los scripts de Node escriben con `process.stdout.write` y `process.stderr.write`.
- **Tipos:** `npm run typecheck`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), un commit por unidad de trabajo con sus pruebas y documentación.

## Limitaciones conocidas

- Los datos viven en el navegador: no se comparten entre dispositivos ni usuarios, y se pierden si se borran los datos del sitio.
- La clave de administración es una constante en el código del cliente: sirve para la demostración, no ofrece seguridad real.
- Una sola moneda (UYU) y cuatro categorías fijas; solo los presupuestos son editables.
- Los presupuestos son únicos y no varían por mes.
- Si la fecha del sistema cambia con la pestaña abierta, el resumen pasa al nuevo mes a medianoche o al volver a la pestaña; no hay sincronización entre pestañas distintas.
- Los repositorios son síncronos (ver la sección de integración con backend).
- Las tipografías se cargan desde Google Fonts, por lo que requieren conexión en la primera visita.
- Los montos son pesos enteros: se aceptan `1500`, `1.500` y `$ 1.500` (el punto solo como separador de miles en grupos de tres cifras); los montos con decimales (`1500,50`, `1.5`) se rechazan con un mensaje claro.
- Si el almacenamiento del navegador está lleno o bloqueado, los cambios viven solo en memoria hasta que se pueda volver a guardar (la interfaz lo avisa); cerrar la pestaña antes de eso los pierde.

## Licencia y créditos

Uso privado. Proyecto desarrollado para Clínica Veterinaria Sienra a través de Kodarvia.

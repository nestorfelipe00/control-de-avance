# Control de Avance BIM — Hospital de Coquimbo

Plataforma web interactiva para el **control de avance de obra semanal por partidas**, sobre el
Modelo de Coordinación Centralizado (federado) en Speckle.

Filtras por **Estatus**, **Semana de Ejecución** o **Nivel**, y el visor 3D + los indicadores
(KPIs, dona, barras y tabla) se actualizan; los objetos del modelo se recolorean por su estado
(Por Ejecutar / En Progreso / Ejecutado).

## Stack
- **Vite + React** — frontend (deploy en Vercel)
- **@speckle/viewer** — visor 3D del modelo federado
- **Recharts** — dona y barras
- **Supabase** — base de datos de avance (fase 2)

## Estado actual (fase 1)
- Partidas **reales** de ARQ desde `src/data/partidas.arq.json` (extraídas del Excel de ponderadores;
  especialidad ARQ, cuantificable en BIM = «sí», 286 partidas).
- **Datos de avance MOCK** (estado/semana/nivel/%): generados en `src/data/mockAvance.js`. Sirven para
  desarrollar el dashboard sin depender aún de Supabase ni de terreno.
- El visor apunta al modelo Speckle `1a3ef97d52 / 51f6f1a7ce`. **Ese modelo aún no tiene geometría**
  publicada (0 versiones): hasta que se envíe desde Revit, el visor se muestra vacío con un aviso.

## Cómo ejecutar (requiere autorización del usuario para instalar/levantar)
```bash
npm install
cp .env.example .env   # ajusta valores si aplica
npm run dev
```
Abre http://localhost:5173

> ⚠️ El asistente NO ejecuta `npm install` ni el servidor sin permiso explícito.

## Prototipo sin build
`prototipo.html` es una **maqueta autocontenida** (un solo archivo, sin dependencias) del dashboard con
las partidas reales y datos demo. Ábrela directo en el navegador o revísala como Artifact.

## Fases
1. **Fase 1 (actual):** dashboard con partidas reales + avance mock. Visor conectado (a la espera de geometría).
2. **Fase 2:** sustituir mock por **Supabase** (ver `supabase/schema.sql`); ETL desde pyRevit → MCP → Supabase.
3. **Fase 3:** deploy en Vercel, modelo privado con token server-side, línea de tiempo 4D, monografías.

Ver `docs/ARCHITECTURE.md` para el detalle.

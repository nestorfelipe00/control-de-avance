# Arquitectura — Control de Avance BIM

## 1. Objetivo
Visualizar en tiempo (casi) real el avance de cantidades de obra sobre el modelo BIM federado,
con actualización semanal, y visualización de monografías por semana.

## 2. Flujo de datos (end-to-end)
```
Revit (.rvt)
  │  pyRevit (Python): extrae parámetros de avance + IDs (UniqueId)
  ▼
MCP (Model Context Protocol / Claude): estructura y valida la data
  ▼
Supabase (Postgres): tabla de avance por elemento/partida  ◄── plan semanal, ponderadores
  ▲                                                             │
  │  @supabase/supabase-js (lectura)                            │
Frontend (Vite+React, Vercel)                                   │
  ├─ Speckle Viewer: geometría del modelo federado ────────────┘ (recolor por ID según estado)
  └─ Recharts: KPIs, dona (m²/semana), barras (avance/semana), tabla por partida
```

## 3. Módulos del frontend
| Carpeta | Rol |
|---|---|
| `src/config/` | Configuración de Speckle y fuente de datos (env). |
| `src/domain/` | Lógica pura: `constants`, `colors` (paleta estados + rampa semanas), `aggregations` (KPIs/gráficos). |
| `src/lib/` | `speckleViewer` (init/carga/recolor), `supabaseClient` (fase 2). |
| `src/data/` | `partidas.arq.json` (real), `mockAvance.js` (avance demo), `avanceRepository` (mock↔supabase). |
| `src/hooks/` | `useAvanceData` (carga de datos). |
| `src/components/` | Header, KpiCards, Filters, ViewerPanel, DonutSemana, BarrasAvance, PartidasTable. |

## 4. Modelo de datos (registro de avance)
`{ id_elemento, partida, edt, nivel, semana, estado, cantidad, unidad, avance_pct }`
- `id_elemento`: UniqueId de Revit = `applicationId` en Speckle → clave para recolorear.
- `estado`: `por_ejecutar | en_progreso | ejecutado`.
- `unidad`: `m2` | `c/u` (no se suman entre sí).

## 5. Decisión: recolor requiere el paquete @speckle/viewer
El recoloreo por dato necesita control programático de objetos por ID (`FilteringExtension`),
por eso es una app real (no un iframe embed y no un Artifact de Claude, cuyo sandbox bloquea las
conexiones externas que el viewer necesita).

## 6. Mapeo de IDs (crítico)
Los datos de avance vienen por UniqueId de Revit; el viewer colorea por speckle object id. Al cargar,
`SpeckleViewerController` recorre el árbol y arma `applicationId → speckleId`. **Requisito:** el envío
de pyRevit/Speckle debe incluir el UniqueId como parámetro para poder cruzar.

## 7. Seguridad del modelo privado
- Desarrollo: modelo público temporal (actual: el proyecto está PUBLIC).
- Producción: token de solo-lectura server-side (Vercel env var / función intermedia). Nunca en el cliente.

## 8. Roadmap
- [ ] Fase 2: schema Supabase + ETL pyRevit→MCP→Supabase (ver `supabase/schema.sql`).
- [ ] Publicar geometría del modelo en Speckle (0 versiones hoy).
- [ ] Línea de tiempo 4D (slider de semanas con play).
- [ ] Click en elemento → ficha; filtros cruzados tabla↔3D.
- [ ] Generación de monografía semanal (snapshot + KPIs).
- [ ] Deploy en Vercel + token server-side.

# CLAUDE.md — Control de Avance BIM

Contexto para asistentes de IA que trabajen en este repositorio.

## Qué es
Plataforma web de control de avance de obra semanal por partidas, sobre el modelo BIM federado en
Speckle del Hospital de Coquimbo. Stack: Vite+React, @speckle/viewer, Recharts, Supabase (fase 2), Vercel.

## Reglas de trabajo del usuario (IMPORTANTES)
- **Preguntar SIEMPRE antes de ejecutar/instalar/levantar servidores/publicar.** No correr `npm install`
  ni `npm run dev` sin autorización explícita. (El antivirus RAV marca la ejecución de PowerShell.)
- **Un problema a la vez**, parcelado en partes, validando cada parte antes de seguir.
- **Skills en automático + avisar** cuál se usa al usarla.
- Reparto: Claude = trabajo complejo; ChatGPT (plan básico) = tareas simples con prompt autocontenido.

## Convenciones de datos
- Partidas reales: `src/data/partidas.arq.json` (de «REVISION DE PONDERADORES BIM.xlsx», hoja
  «Detalle control bim», especialidad ARQ, cuantificable en BIM = «sí»). NO inventar partidas.
- Avance actual = **MOCK** (`src/data/mockAvance.js`). Fase 2 = Supabase (`avanceRepository.js`).
- `id_elemento` = UniqueId de Revit = applicationId en Speckle (clave para recolorear).
- Estados: `por_ejecutar | en_progreso | ejecutado`. Unidades: `m2`, `c/u` (no sumar entre sí).

## Speckle
- Servidor `app.speckle.systems`, Project `1a3ef97d52`, Model `51f6f1a7ce` (público hoy, 0 versiones).
- El recolor necesita @speckle/viewer (no iframe, no Artifact).

## Estructura
Ver `docs/ARCHITECTURE.md`. Lógica pura en `src/domain/`, IO en `src/lib/` y `src/data/`.

## Estilo de código
- React 18 + JSX, módulos ES. Componentes funcionales, hooks. Comentarios en español.
- Colores/tema vía CSS variables (theme-aware claro/oscuro). No hardcodear colores en componentes salvo
  los de estado que vienen de `domain/colors.js`.

-- ============================================================================
--  Esquema Supabase (fase 2) — Control de Avance BIM Hospital de Coquimbo
--  Referencia de diseño. Ejecutar en el SQL editor de Supabase cuando se autorice.
-- ============================================================================

-- Catálogo de partidas (desde REVISION DE PONDERADORES BIM.xlsx)
create table if not exists partidas (
  id            text primary key,           -- Id del Excel (ej. "1.7.2.2.7")
  edt           text,                        -- código EDT
  nombre        text not null,               -- nombre de la partida
  especialidad  text not null default 'ARQ', -- ARQ / EST / MEP
  unidad        text,                        -- m2 / c/u
  cantidad      numeric,                     -- cantidad total planificada
  ponderacion   numeric,                     -- ponderador BIM
  cuantificable_bim boolean default true
);

-- Cronograma semanal (plan de obra)
create table if not exists semanas (
  numero        int primary key,             -- 1..N
  fecha_inicio  date,
  fecha_fin     date
);

-- Avance por elemento del modelo (grano fino: 1 fila por elemento Revit)
create table if not exists avance_elementos (
  id            bigint generated always as identity primary key,
  id_elemento   text not null,               -- UniqueId de Revit = applicationId Speckle
  partida_id    text references partidas(id),
  nivel         text,                        -- parámetro de nivel de Revit
  semana        int references semanas(numero),  -- semana de ejecución (null = por ejecutar)
  estado        text not null default 'por_ejecutar'
                check (estado in ('por_ejecutar','en_progreso','ejecutado')),
  cantidad      numeric,                     -- cantidad del elemento
  unidad        text,
  avance_pct    numeric not null default 0 check (avance_pct between 0 and 100),
  actualizado_en timestamptz default now()
);

create index if not exists idx_avance_id_elemento on avance_elementos(id_elemento);
create index if not exists idx_avance_semana on avance_elementos(semana);
create index if not exists idx_avance_estado on avance_elementos(estado);

-- Vista de resumen por partida (para la tabla del dashboard)
create or replace view v_resumen_partida as
select p.nombre as partida, a.unidad,
       sum(a.cantidad) as cantidad,
       case when sum(a.cantidad) > 0
            then round(sum(a.cantidad * a.avance_pct / 100.0) / sum(a.cantidad) * 100, 1)
            else 0 end as pct_ejecutado
from avance_elementos a
join partidas p on p.id = a.partida_id
group by p.nombre, a.unidad
order by cantidad desc;

-- RLS: habilitar y permitir lectura anónima (o vía token) según política del proyecto.
-- alter table avance_elementos enable row level security;
-- create policy "lectura publica" on avance_elementos for select using (true);

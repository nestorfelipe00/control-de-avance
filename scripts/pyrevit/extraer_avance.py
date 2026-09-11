# -*- coding: utf-8 -*-
"""
Script base pyRevit — Extracción de datos de avance del modelo ARQ.

Extrae, por cada elemento de las categorías de terminaciones ARQ:
  - UniqueId (clave para cruzar con Speckle: applicationId)
  - Categoría, Nivel, Tipo
  - Parámetros de avance (partida, estado, semana) si existen
  - Cantidades (Área / Volumen / Conteo) según corresponda

Salida: un JSON limpio listo para el MCP de Claude / carga a Supabase.

USO: ejecutar desde pyRevit (pestaña de scripts) con el modelo abierto en Revit.
Requiere pyRevit instalado. Ajustar CATEGORIAS y NOMBRES_PARAMETROS al modelo real.

NOTA: es un ESQUELETO. Revisar los nombres de parámetros reales del modelo antes de usar.
"""
import json
import os
from pyrevit import revit, DB

doc = revit.doc

# --- Configuración -----------------------------------------------------------
# Categorías de terminaciones a extraer (ajustar a las del modelo ARQ).
CATEGORIAS = [
    DB.BuiltInCategory.OST_Floors,
    DB.BuiltInCategory.OST_Walls,
    DB.BuiltInCategory.OST_Ceilings,
    DB.BuiltInCategory.OST_Doors,
    DB.BuiltInCategory.OST_Windows,
    DB.BuiltInCategory.OST_Roofs,
    DB.BuiltInCategory.OST_CurtainWallPanels,
]

# Nombres candidatos de parámetros de avance en el modelo (ajustar a los reales).
PARAM_PARTIDA = ["Partida", "EDT", "Nombre de tarea"]
PARAM_ESTADO = ["Estado de Avance", "Estado", "en ejecucion"]
PARAM_SEMANA = ["Semana de Ejecucion", "Semana"]

SALIDA = os.path.join(os.path.expanduser("~"), "Desktop", "avance_arq.json")
# ----------------------------------------------------------------------------


def get_param(el, nombres):
    """Devuelve el primer parámetro no vacío entre varios nombres candidatos."""
    for n in nombres:
        p = el.LookupParameter(n)
        if p and p.HasValue:
            try:
                if p.StorageType == DB.StorageType.String:
                    v = p.AsString()
                elif p.StorageType == DB.StorageType.Double:
                    v = p.AsDouble()
                elif p.StorageType == DB.StorageType.Integer:
                    v = p.AsInteger()
                else:
                    v = p.AsValueString()
                if v not in (None, ""):
                    return v
            except Exception:
                continue
    return None


def get_nivel(el):
    try:
        lp = el.LookupParameter("Level") or el.LookupParameter("Nivel")
        if lp and lp.HasValue:
            lid = lp.AsElementId()
            lvl = doc.GetElement(lid)
            if lvl:
                return lvl.Name
    except Exception:
        pass
    return None


def get_cantidad(el):
    """Área (m2) si aplica; si no, cuenta como 1 unidad (c/u)."""
    a = el.LookupParameter("Area") or el.LookupParameter("Área")
    if a and a.HasValue:
        # Revit guarda áreas en pies²; convertir a m².
        return round(a.AsDouble() * 0.09290304, 2), "m2"
    return 1, "c/u"


def main():
    registros = []
    for bic in CATEGORIAS:
        col = (
            DB.FilteredElementCollector(doc)
            .OfCategory(bic)
            .WhereElementIsNotElementType()
            .ToElements()
        )
        for el in col:
            cantidad, unidad = get_cantidad(el)
            registros.append(
                {
                    "id_elemento": el.UniqueId,  # == applicationId en Speckle
                    "categoria": el.Category.Name if el.Category else None,
                    "tipo": el.Name,
                    "nivel": get_nivel(el),
                    "partida": get_param(el, PARAM_PARTIDA),
                    "estado": get_param(el, PARAM_ESTADO),
                    "semana": get_param(el, PARAM_SEMANA),
                    "cantidad": cantidad,
                    "unidad": unidad,
                }
            )

    with open(SALIDA, "w") as f:
        json.dump(registros, f, ensure_ascii=False, indent=2)

    print("Extraídos {} elementos -> {}".format(len(registros), SALIDA))


if __name__ == "__main__":
    main()

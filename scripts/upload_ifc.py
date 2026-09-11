# -*- coding: utf-8 -*-
"""
Sube un archivo IFC a Supabase Storage (bucket público) y muestra su URL pública.

SEGURIDAD: la clave se lee de una variable de entorno, NUNCA se escribe en el código.
Usa la SERVICE ROLE key (Project Settings → API → service_role) SOLO en tu equipo.

USO (PowerShell):
  $env:SUPABASE_URL = "https://sdlvtzuiuivlzohsmzim.supabase.co"
  $env:SUPABASE_SERVICE_KEY = "<tu service_role key>"
  python upload_ifc.py "D:\Hospital de coquimbo\RVT\AVANCES CANTIDADES\MODELOS 3D DE CONTROL IFC\modelo.ifc" modelos

USO (bash):
  export SUPABASE_URL="https://sdlvtzuiuivlzohsmzim.supabase.co"
  export SUPABASE_SERVICE_KEY="<tu service_role key>"
  python upload_ifc.py "/ruta/modelo.ifc" modelos

Argumentos: <ruta_ifc> [bucket=modelos]
Requiere: pip install requests
"""
import os
import sys
import requests

def main():
    if len(sys.argv) < 2:
        print("Uso: python upload_ifc.py <ruta_ifc> [bucket]")
        sys.exit(1)

    ruta = sys.argv[1]
    bucket = sys.argv[2] if len(sys.argv) > 2 else "modelos"

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("ERROR: define SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno.")
        sys.exit(1)
    if not os.path.isfile(ruta):
        print("ERROR: no existe el archivo: %s" % ruta)
        sys.exit(1)

    nombre = os.path.basename(ruta)
    size_mb = os.path.getsize(ruta) / (1024 * 1024)
    print("Subiendo %s (%.1f MB) al bucket '%s'..." % (nombre, size_mb, bucket))

    endpoint = "%s/storage/v1/object/%s/%s" % (url.rstrip("/"), bucket, nombre)
    headers = {
        "Authorization": "Bearer %s" % key,
        "apikey": key,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",  # sobrescribe si ya existe
    }
    with open(ruta, "rb") as f:
        # stream para archivos grandes (no carga todo en memoria)
        resp = requests.post(endpoint, headers=headers, data=f)

    if resp.status_code in (200, 201):
        publica = "%s/storage/v1/object/public/%s/%s" % (url.rstrip("/"), bucket, nombre)
        print("OK. URL pública:")
        print(publica)
        print("\n-> Ponla en .env como VITE_IFC_URL y en Vercel, y usa VITE_VIEWER_MODE=ifc")
    else:
        print("ERROR %s: %s" % (resp.status_code, resp.text[:500]))
        if resp.status_code == 404:
            print("Sugerencia: crea primero el bucket '%s' (público) en Supabase → Storage." % bucket)
        sys.exit(1)


if __name__ == "__main__":
    main()

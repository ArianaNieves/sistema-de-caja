# Sistema de Caja ERP

PWA construida con React + Vite que usa Google Sheets (via Apps Script) como backend.

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Google Apps Script (Web App)
- **Base de datos**: Google Sheets
- **Hosting**: Netlify

## Estructura

```
src/
  api/        → cliente HTTP para Apps Script
  components/ → Layout, Navbar, StatCard, Spinner
  pages/      → Dashboard, Ventas, Productos, Caja, Inventario, Clientes, Cuotas
  hooks/      → useConfig (colores dinámicos desde CONFIG del Sheet)
  types/      → tipos TypeScript de todas las entidades

apps-script/  → archivos .gs para pegar en Apps Script
  00_API_ROUTER.gs  → doGet/doPost + switch de acciones
  01_CONFIG.gs
  02_PRODUCTOS.gs
  03_VENTAS.gs
  04_CAJA.gs
  05_INVENTARIO.gs
  06_CLIENTES.gs
  07_CUOTAS.gs
  08_KPIS.gs
```

## Setup local

```bash
npm install
cp .env.example .env.local
# editar .env.local con tu URL de Apps Script
npm run dev
```

## Configurar Apps Script

1. Abrir el Google Sheet del ERP
2. Ir a **Extensions > Apps Script**
3. Crear un archivo nuevo por cada `.gs` de la carpeta `apps-script/`
4. Pegar el contenido correspondiente
5. Cambiar `API_KEY` en `00_API_ROUTER.gs` por una clave segura
6. Ir a **Implementar > Nueva implementación**
   - Tipo: Web App
   - Ejecutar como: Yo
   - Acceso: Cualquier persona
7. Copiar la URL generada

## Configurar variables de entorno

Editar `.env.local`:
```
VITE_API_URL=https://script.google.com/macros/s/TU_ID/exec
VITE_API_KEY=la_misma_clave_que_pusiste_en_apps_script
```

## Deploy en Netlify

1. Conectar el repo en [netlify.com](https://netlify.com)
2. Configurar las variables de entorno (`VITE_API_URL`, `VITE_API_KEY`)
3. Deploy automático en cada push a `main`

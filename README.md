# APP CRUD Landing Ofertas y Promociones

App para gestionar los productos de la landing de ofertas y promociones de Falabella. Permite agregar, editar, ocultar, cambiar orden sellout y eliminar productos.

## Tecnologías principales

-  React + TypeScript
-  Vite - Construcción y desarrollo
-  Supabase - Backend y base de datos
-  Supabase Auth - Sistema de Autenticación
-  Supabase Realtime - Sistema de suscripción a eventos en tiempo real mediante WebSockets
-  ShadCN UI - Componentes visuales
-  TanStack Table - Tabla interactiva
-  React Hook Form + Zod - Formularios y validación

## Funcionalidades

-  Agregar productos
-  Editar productos existentes
-  Ocultar productos
-  Eliminar productos
-  Ver productos ocultos
-  Subir productos masivamente desde archivo .csv (vía interfaz de Supabase)

## Cómo usar el proyecto

### Instalación

Clonar el repositorio y ejecutar:

```js
npm clone https://github.com/jeison0894/APPLandingOfertasPromociones.git
```

```js
npm install
```

Correr la aplicación

```js
npm run dev
```

## Uso de Supabase

La aplicación utiliza Supabase como backend para gestionar la base de datos y la autenticación.

La tabla principal es listProducts, donde se almacenan todos los productos.

### Importar productos en masa (CSV)

> Se recomienda descargar el archivo CSV directamente desde Google Sheets para evitar problemas de formato.

Para subir productos masivamente, usa la función de importación de CSV desde la consola de Supabase:

1. Accede a https://app.supabase.com.
2. Inicia sesión con la cuenta empresarial vinculada al proyecto.
3. Selecciona el proyecto correspondiente.
4. En el panel lateral, ve a Table Editor.
5. Selecciona la tabla listProducts.
6. Haz clic en Insert y luego en "Import data from CSV" y carga tu archivo csv.

### Credenciales y acceso

El proyecto está asociado a una cuenta Supabase con un correo Gmail empresarial.

Por seguridad, las credenciales y el acceso deben mantenerse confidenciales y compartirse únicamente con el equipo autorizado.

## Despliegue

El proyecto está actualmente desplegado en Vercel desde una cuenta personal de GitHub:

🔗 https://app-landing-ofertas-promociones.vercel.app/

### Sobre futuras implementaciones o migraciones

En caso de que sea necesario desplegar nuevamente el proyecto, se pueden seguir estos pasos para hacer el deploy desde cualquier cuenta con acceso al repositorio:

1. Ingresar a https://vercel.com con una cuenta autorizada.
2. Hacer clic en "Add New Project" y seleccionar el repositorio desde GitHub.
3. Vercel detectará automáticamente la configuración (Vite + React).
4. Confirmar la configuración predeterminada y hacer clic en "Deploy".
5. Una vez completado el despliegue, Vercel generará una URL pública que puede ser compartida o vinculada a un dominio personalizado si se desea.

## Notas

-  La configuración de Supabase ya está lista y vinculada con la aplicación.
-  Las políticas de seguridad (RLS) están configuradas para permitir inserciones, lecturas, actualizaciones y eliminaciones según las reglas definidas.

## Contribuciones

Este proyecto fue creado y es mantenido por Jeison Garzón.
Para cualquier mejora, puedes abrir un issue o pull request.

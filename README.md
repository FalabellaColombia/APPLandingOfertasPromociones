# APP CRUD Landing Ofertas y Promociones

App para gestionar los productos de la landing de ofertas y promociones de Falabella. Permite agregar, editar, ocultar, cambiar orden sellout y eliminar productos.

## Tecnologías principales

-  React + TypeScript
-  Vite - Construcción y desarrollo
-  Supabase - Backend y base de datos
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

Para subir productos masivamente, usa la función de importación de CSV desde la consola de Supabase:

1. Accede a https://app.supabase.com.
2. Inicia sesión con la cuenta empresarial vinculada al proyecto.
3. Selecciona el proyecto correspondiente.
4. En el panel lateral, ve a Table Editor.
5. Selecciona la tabla listProducts.
6. Haz clic en Import CSV y carga tu archivo.

### Credenciales y acceso

El proyecto está asociado a una cuenta Supabase con un correo Gmail empresarial.

Por seguridad, las credenciales y el acceso deben mantenerse confidenciales y compartirse únicamente con el equipo autorizado.

## Notas

La configuración de Supabase ya está lista y vinculada con la aplicación.
Las políticas de seguridad (RLS) están configuradas para permitir inserciones, lecturas, actualizaciones y eliminaciones según las reglas definidas.

## Contribuciones

Este proyecto fue creado y es mantenido por Jeison Garzón.
Para cualquier mejora, puedes abrir un issue o pull request.

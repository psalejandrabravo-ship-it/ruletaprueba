# Ruleta de Situaciones

Aplicación web de **MIRARIM** para profesionales de la educación y la psicología que trabajan con niños y adolescentes.

Permite girar una ruleta de categorías psicoeducativas y conversar a partir de una pregunta o situación. No solicita, registra ni guarda nombres, respuestas, diagnósticos ni otros datos personales.

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

La aplicación queda disponible en el puerto que indique Vite (en este proyecto, `8080`).

## Compilación

```bash
npm run build
```

La compilación genera el sitio listo para producción. Comprueba TypeScript con:

```bash
npm run typecheck
```

## Visualizar la compilación

```bash
npm run preview
```

o, si necesitas reiniciar un visor de producción ya iniciado:

```bash
npm run preview:restart
```

## Publicación como sitio estático

La lógica del juego se ejecuta por completo en el navegador. No hay backend propio, autenticación, base de datos remota ni API externas.

1. Ejecuta `npm run build`.
2. Publica el resultado de la compilación en un alojamiento estático o en un proveedor compatible con el adaptador del proyecto (por ejemplo Vercel).
3. No hace falta configurar variables de entorno ni secretos.

Tras desplegarla, la aplicación sigue funcionando sin conexión a servicios de terceros: el contenido y las personalizaciones viven en el navegador de quien facilita la actividad.

## Dónde está el contenido predeterminado

Las cuatro categorías iniciales y sus preguntas están en:

[`src/data/default-content.ts`](src/data/default-content.ts)

Puedes cambiar textos, el orden o añadir preguntas en ese archivo **sin modificar la interfaz**. Los colores de apoyo del editor están en [`src/data/category-colors.ts`](src/data/category-colors.ts) y los límites de longitud en [`src/data/limits.ts`](src/data/limits.ts).

Si editas el contenido incluido desde la aplicación, esos cambios se guardan como una configuración personalizada en el navegador y no alteran este archivo.

## Dónde están los recursos de marca

Los archivos oficiales de MIRARIM se copian tal cual a:

[`public/assets/brand/`](public/assets/brand/)

- `MIRARIM-horizontal-color.svg` — logotipo sobre fondos claros
- `MIRARIM-horizontal-blanco.svg` — logotipo sobre fondo índigo
- `MIRARIM-isotipo-color-1024.png` — isotipo
- `00-LEEME.txt`, `MIRARIM-paleta.txt`, `MIRARIM-tipografia.txt` — documentación de marca

No sustituyas estos archivos por reconstrucciones, ni los recolorees, recortes o animes.

## Tipografía

La interfaz usa **Nunito Sans** (pesos 400, 600 y 800), integrada de forma local mediante el paquete `@fontsource/nunito-sans`. No depende de Google Fonts ni de una conexión a Internet para mostrar el texto.

Licencia SIL Open Font License 1.1: [`licenses/OFL-Nunito-Sans.txt`](licenses/OFL-Nunito-Sans.txt).

El logotipo de MIRARIM **no** se sustituye por texto en Nunito Sans: siempre se usan los SVG oficiales.

## Cómo cambiar las preguntas predeterminadas sin modificar la interfaz

1. Abre `src/data/default-content.ts`.
2. Edita el arreglo `DEFAULT_CATEGORIES` (nombre, color y lista de preguntas).
3. Conserva un `id` estable por categoría y por pregunta.
4. Vuelve a iniciar la aplicación. Si el navegador ya tenía una personalización guardada, usa **Restablecer contenido** para recuperar el archivo actualizado.

## Qué se guarda en `localStorage`

Solo la configuración de la actividad, bajo la clave `mirarim-ruleta-config`:

- modalidad seleccionada (contenido incluido o personalizado)
- categorías activadas
- categorías y preguntas personalizadas
- versión del esquema (`version: 1`)

**No se guarda:**

- respuestas
- nombres de participantes
- diagnósticos u otros datos personales
- resultados de la ronda
- historial de actividades
- preguntas utilizadas en rondas anteriores

La capa de persistencia está en [`src/lib/persistence/local-storage.ts`](src/lib/persistence/local-storage.ts) y se puede reemplazar en el futuro por un almacenamiento asociado a una cuenta sin reescribir la lógica del juego.

## Cómo restablecer los datos locales durante una prueba

En la vista **Preparar actividad**, pulsa **Restablecer contenido** y confirma. Eso elimina las personalizaciones locales y recupera las categorías originales.

También puedes borrar la clave a mano en la consola del navegador:

```js
localStorage.removeItem("mirarim-ruleta-config");
```

Luego recarga la página.

## Organización del código

- `src/app/App.tsx` — orquesta las cuatro vistas
- `src/components/views/` — Inicio, Preparar, Juego y Resumen
- `src/components/wheel/` — ruleta y leyenda
- `src/components/editor/` — administración de categorías
- `src/components/modals/` — cómo jugar, pregunta, confirmaciones
- `src/lib/game/` — selección aleatoria, rotación y validación
- `src/lib/persistence/` — guardado local
- `src/store/app-store.ts` — estado de la sesión (no persistido)
- `src/data/` — contenido y límites

## Privacidad

La aplicación está pensada para usarse en sesiones, grupos y aulas sin recoger datos de niñas, niños o adolescentes. Utiliza siempre preguntas anónimas y generales.

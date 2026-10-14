# Esquivar para Android · 0.2.0

Juego móvil de una pelota roja que avanza automáticamente por un sendero en perspectiva dentro de una selva tropical. Desliza a izquierda y derecha para esquivar troncos, raíces y lianas. El nivel conserva su recorrido de unos 30 segundos y sus ocho obstáculos originales.

## Controles y objetos

- Cinco corazones. Cada obstáculo resta un corazón una sola vez; la quinta colisión termina la partida.
- Estrellas doradas coleccionables y contador en la interfaz.
- Potenciador violeta: duplica el valor de las estrellas durante diez segundos de partida. No cambia la velocidad ni el control de la pelota.
- Desliza con el dedo, sin saltos al apoyarlo. En PC puedes usar flechas o A/D.
- Reinicia con el botón ↻ de la esquina superior o desde la pantalla de resultado. Espacio también funciona al terminar.

## Pantalla y gráficos

La aplicación solicita orientación vertical en Android. En una ventana horizontal se muestra un aviso y se pausa el avance, también en equipos cuyo sistema ignore la orientación solicitada. Al volver a vertical, la partida continúa.

El canvas ocupa toda el área útil, respetando las barras y recortes del teléfono. La altura virtual cambia con la proporción de la pantalla; los carriles, la velocidad y las colisiones permanecen iguales. No se recorta el camino ni se estira la pelota.

El sendero tiene tierra, piedras pequeñas, musgo, raíces en los bordes y sombras. La selva usa capas de follaje, árboles, helechos y hojas con balanceo suave. Los obstáculos conservan su posición sobre el suelo. El renderizado Canvas 2D, el fondo prerenderizado, las texturas procedurales reutilizadas y un número fijo de objetos evitan crear decoración durante cada fotograma. La preferencia de movimiento reducido desactiva el balanceo y reduce los efectos ambientales.

## Desarrollo

Requiere Node.js 24 y npm 11. Para Android: JDK 21, Platform 36 y Build Tools 35.0.0 y 36.0.0.

```sh
npm ci
npm run dev
npm test
npm run build
```

Abre el navegador en una ventana vertical o usa la emulación de teléfono en las herramientas de desarrollo. No se necesitan credenciales ni servicios externos para jugar; el APK contiene los recursos locales.

## Actualizar y probar en Android Studio

1. Descarga la rama `main` actualizada de GitHub (Code → Download ZIP), o ejecuta `git pull --ff-only` si utilizas un clon Git limpio. Si descargaste ZIP, descomprímelo en una carpeta nueva para conservar tu copia anterior.
2. Abre una terminal en la raíz del proyecto, donde está `package.json`, y ejecuta:

   ```sh
   npm ci
   npm run android:sync
   ```

   Este paso compila el juego y copia la versión nueva a Android. No basta con volver a ejecutar un proyecto Android con los recursos antiguos.
3. En Android Studio, abre la carpeta `android` de esa copia actualizada. Espera a que termine la sincronización de Gradle e instala los componentes SDK que solicite. Selecciona JDK 21 como Gradle JDK si es necesario.
4. Selecciona el emulador Pixel 6 y pulsa Run ▶. Comprueba la versión `0.2.0`, el escenario sin márgenes, cinco corazones, recogida de estrellas y deslizamiento.

Para generar un APK desde la terminal de Android Studio (dentro de `android`), en Windows:

```powershell
.\gradlew.bat assembleDebug
```

En macOS/Linux:

```sh
./gradlew assembleDebug
```

Archivo generado: `android/app/build/outputs/apk/debug/app-debug.apk`. Se puede arrastrar sobre el emulador. Si aparece `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, la versión previa estaba firmada con otra clave de desarrollo: desinstala esa versión del emulador y vuelve a ejecutar Run.

Desde la raíz del proyecto también puedes usar `npm run android:open` para abrir Android Studio. `npm run android:debug` combina sincronización y compilación en Linux/macOS. Configura `ANDROID_HOME` o un `android/local.properties` local con la ruta del SDK. No guardes rutas personales ni claves en Git.

La aplicación usa el identificador provisional `com.esquivar.game`. El APK de depuración no es una versión para Google Play; la firma de publicación y la ficha de la tienda siguen pendientes.

## Pruebas

Con el servidor de Vite activo en otra terminal:

```sh
npx playwright install chromium
npm run test:mobile
```

`npm test` verifica perspectiva, límites de movimiento, daño único, cinco vidas, estrellas, duración del potenciador y final del nivel. Las pruebas móviles comprueban seis tamaños verticales, áreas seguras, ocupación total del canvas, controles táctiles, pausa horizontal, reinicio, recogidas, derrota y victoria. Puedes indicar `GAME_URL` y `CHROMIUM_PATH` para otro puerto o un Chromium instalado.

Las pruebas de navegador y la compilación Android no sustituyen pruebas de rendimiento en dispositivos reales. Compatibilidad prevista: Android 7.0 (API 24) o posterior con Android System WebView actualizado.

## Organización

- `src/scenes/`: partida, interfaz y efectos.
- `src/game/`: perspectiva, nivel, vidas y recogidas independientes del motor.
- `src/render/`: ilustración procedural y recursos gráficos reutilizados.
- `public/assets/`: futuros recursos y licencias.
- `tests/`: reglas y adaptación móvil.
- `android/`: aplicación Android y Gradle Wrapper.
- `capacitor.config.ts`: configuración nativa.
- `scripts/cloud-setup.sh`: preparación del entorno de nube.

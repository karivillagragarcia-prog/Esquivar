# Esquivar para Android

Juego 2D con TypeScript, Phaser y Capacitor. La aplicación Android incluye el juego y puede ejecutarse sin conexión. La vista web permite iterar durante el desarrollo.

## Compatibilidad y controles

- Android 7.0 (API 24) o posterior, con Android System WebView actualizado.
- Arrastra o toca dentro del juego para mover al jugador. En PC, flechas o A/D.
- Diseño adaptable a teléfonos y tabletas, vertical y horizontal, con áreas seguras y botón de al menos 48 px.
- El área de juego conserva su proporción para que las reglas sean iguales en todos los tamaños. Pueden quedar márgenes en pantallas alargadas.
- La partida pausa cuando la aplicación pasa a segundo plano.

No se garantiza compatibilidad con todos los modelos: hay que probar dispositivos de gama baja, distintos WebView, recortes de pantalla, navegación por gestos y versiones de Android.

## Desarrollo

Requiere Node.js 24 y npm 11.

```sh
npm ci
npm run dev
npm test
npm run build
```

## Android

Requiere JDK 21 y Android SDK con Platform 36 y Build Tools 35.0.0 y 36.0.0. Configura `ANDROID_HOME` o `android/local.properties` con la ubicación del SDK. No guardes rutas personales ni claves en Git.

```sh
npm run android:sync
npm run android:open
npm run android:debug
```

`android:open` requiere Android Studio en una máquina con interfaz gráfica. `android:debug` genera `android/app/build/outputs/apk/debug/app-debug.apk`, un APK de desarrollo, no una versión de publicación. Para instalar en un dispositivo conectado con depuración USB: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.

El identificador provisional es `com.esquivar.game`. Antes de publicar en Google Play hay que definir el identificador definitivo, iconos, firma privada de publicación y ficha de la tienda. No guardes claves de firma en Git.

## Pruebas de pantallas

Con el servidor de desarrollo activo en otra terminal:

```sh
npx playwright install chromium
npm run test:mobile
```

Se comprueban seis tamaños, coordenadas táctiles, rotación, reinicio y errores JavaScript. Puedes indicar `GAME_URL` y `CHROMIUM_PATH` para usar otro puerto o un Chromium instalado. Es una simulación de pantalla y entrada táctil en navegador; no sustituye una prueba en Android.

## Organización

- `src/scenes/`: pantallas y partida.
- `src/game/`: reglas independientes del motor.
- `public/assets/`: imágenes y sonidos.
- `tests/`: reglas y adaptación móvil.
- `android/`: aplicación Android y Gradle Wrapper.
- `capacitor.config.ts`: nombre, identificador y configuración nativa.
- `scripts/cloud-setup.sh`: preparación reproducible del entorno en la nube.

No se necesitan credenciales, base de datos ni servicios externos para jugar.

# Esquivar

Prototipo de videojuego 2D para navegador con TypeScript, Phaser y Vite.
Evita los obstáculos rojos con las flechas, A/D o arrastrando en una pantalla táctil. La puntuación y la dificultad aumentan con el tiempo. Reinicia con el botón o con Espacio después de perder.

## Desarrollo

Requiere Node.js 24 y npm 11.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`build` comprueba los tipos y genera el sitio estático en `dist/`. Las pruebas verifican límites de movimiento, colisiones y progresión de dificultad. No sustituyen una prueba visual en navegador.

## Organización

- `src/main.ts`: configuración del motor y entrada.
- `src/scenes/`: escenas y ciclo de la partida.
- `src/game/`: reglas independientes del motor.
- `public/assets/`: imágenes y sonidos.
- `tests/`: pruebas de las reglas.

No se necesitan credenciales, base de datos ni servicios externos para jugar.

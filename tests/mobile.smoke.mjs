import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
});
const sizes = [[320, 568], [360, 640], [393, 873], [412, 915], [800, 1280], [873, 393]];
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5173');
    await page.waitForFunction(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      return game.scene.getScene('Game')?.player !== undefined;
    });
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--safe-area-inset-top', '32px');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', '24px');
      document.documentElement.style.setProperty('--safe-area-inset-left', '16px');
      document.documentElement.style.setProperty('--safe-area-inset-right', '16px');
    });
    await page.waitForTimeout(100);
    const layout = await page.evaluate(() => {
      const canvas = document.querySelector('canvas').getBoundingClientRect();
      const button = document.querySelector('button').getBoundingClientRect();
      const host = document.querySelector('#game').getBoundingClientRect();
      return { canvas: canvas.toJSON(), button: button.toJSON(), host: host.toJSON(), scrollWidth: document.documentElement.scrollWidth };
    });
    assert.ok(layout.canvas.width > 0 && layout.canvas.height > 0);
    assert.ok(layout.canvas.left >= -1 && layout.canvas.right <= width + 1);
    assert.ok(layout.canvas.top >= layout.host.top - 1 && layout.canvas.bottom <= layout.host.bottom + 1);
    assert.ok(layout.button.bottom <= height - 23 && layout.button.height >= 48);
    assert.ok(layout.scrollWidth <= width);
    const x = layout.canvas.x + layout.canvas.width * 0.8;
    const y = layout.canvas.y + layout.canvas.height * 0.8;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(50);
    const playerX = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      return game.scene.getScene('Game').player.x;
    });
    assert.ok(playerX > 300, `el toque se convierte a coordenadas del juego: ${playerX}, ${JSON.stringify(layout)}`);
    const touch = await context.newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: layout.canvas.x + layout.canvas.width * 0.2, y }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(50);
    const draggedX = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      return game.scene.getScene('Game').player.x;
    });
    assert.ok(draggedX < 150, 'arrastrar mueve el jugador');
    // Rota el mismo contexto para comprobar la actualización del canvas.
    await page.setViewportSize({ width: height, height: width });
    await page.waitForTimeout(150);
    const rotated = await page.locator('canvas').boundingBox();
    assert.ok(rotated.x >= -1 && rotated.x + rotated.width <= height + 1);
    assert.ok(rotated.y >= -1 && rotated.y + rotated.height <= width + 1);
    await page.getByRole('button', { name: 'Reiniciar partida' }).tap();
    await page.waitForTimeout(50);
    const restart = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      const scene = game.scene.getScene('Game');
      return { elapsed: scene.elapsed, ended: scene.ended };
    });
    assert.ok(restart.elapsed < 1 && !restart.ended);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}x${height}: pantalla, toque, rotación y reinicio`);
    await context.close();
  }
} finally {
  await browser.close();
}

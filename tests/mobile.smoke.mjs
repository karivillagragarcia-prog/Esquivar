import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const sizes = [[320, 568], [360, 640], [393, 873], [412, 915], [600, 960], [800, 1280]];
// Usa el mismo módulo de entrada que el documento, también con la marca de HMR de Vite.
const state = async page => page.evaluate(async () => {
  const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
  const scene = game.scene.getScene('Game');
  return { x: scene.player.x, progress: scene.run.progress, hearts: scene.run.hearts, stars: scene.run.stars, ended: scene.run.ended, won: scene.run.won, paused: game.isPaused };
});
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5173');
    await page.waitForFunction(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      return game.scene.getScene('Game')?.player !== undefined;
    });
    await page.evaluate(() => {
      for (const [side, value] of Object.entries({ top: 32, bottom: 24, left: 0, right: 0 })) document.documentElement.style.setProperty(`--safe-area-inset-${side}`, `${value}px`);
    });
    await page.waitForTimeout(150);
    const layout = await page.evaluate(() => {
      const canvas = document.querySelector('canvas').getBoundingClientRect();
      const host = document.querySelector('#game').getBoundingClientRect();
      const button = document.querySelector('#restart').getBoundingClientRect();
      return { canvas: canvas.toJSON(), host: host.toJSON(), button: button.toJSON(), scrollWidth: document.documentElement.scrollWidth };
    });
    assert.ok(Math.abs(layout.canvas.width - layout.host.width) < 1, 'sin márgenes horizontales');
    assert.ok(Math.abs(layout.canvas.height - layout.host.height) < 1, 'sin márgenes verticales');
    assert.ok(Math.abs(layout.canvas.y - 32) < 1 && Math.abs(layout.canvas.bottom - (height - 24)) < 1, 'respeta las áreas seguras');
    assert.ok(layout.button.width >= 48 && layout.button.height >= 48);
    assert.ok(layout.scrollWidth <= width);
    const canvas = layout.canvas, y = canvas.y + canvas.height * 0.8;
    await page.touchscreen.tap(canvas.x + canvas.width * 0.8, y);
    await page.waitForTimeout(50);
    assert.equal((await state(page)).x, 240, 'apoyar el dedo no hace saltar la pelota');
    const touch = await context.newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: canvas.x + canvas.width * 0.5, y }] });
    await page.waitForTimeout(50);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: canvas.x + canvas.width * 0.8, y }] });
    await page.waitForTimeout(50);
    assert.ok((await state(page)).x > 300);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: canvas.x + canvas.width * 0.2, y }] });
    await page.waitForTimeout(50);
    assert.ok((await state(page)).x < 150);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.setViewportSize({ width: height, height: width });
    await page.waitForTimeout(150);
    await page.locator('#rotate').waitFor({ state: 'visible' });
    const paused = await state(page);
    assert.equal(paused.paused, true);
    await page.waitForTimeout(150);
    assert.equal((await state(page)).progress, paused.progress, 'horizontal pausa el avance');
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    assert.equal((await state(page)).paused, false);
    await page.getByRole('button', { name: 'Reiniciar partida' }).tap();
    await page.waitForTimeout(100);
    const effects = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      const scene = game.scene.getScene('Game');
      scene.run.progress = 24.5; scene.player.x = 240 + 195 * 0.55; scene.update(0, 50);
      const stars = scene.run.stars;
      scene.run.progress = 108.5; scene.update(0, 50);
      return { stars, boosted: scene.aura.visible, boostText: scene.boostText.text };
    });
    assert.equal(effects.stars, 1);
    assert.equal(effects.boosted, true);
    assert.match(effects.boostText, /×2/);
    await page.getByRole('button', { name: 'Reiniciar partida' }).tap();
    await page.waitForTimeout(100);
    const collision = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      const { LEVEL_ONE } = await import('/src/game/rules.ts');
      const scene = game.scene.getScene('Game');
      const counts = [];
      for (const obstacle of LEVEL_ONE.slice(0, 5)) {
        scene.run.progress = obstacle.distance - 1.5;
        scene.player.x = 240 + 195 * obstacle.lane;
        scene.update(0, 50);
        counts.push(scene.run.hearts);
      }
      return { ended: scene.run.ended, won: scene.run.won, counts };
    });
    assert.deepEqual(collision, { ended: true, won: false, counts: [4, 3, 2, 1, 0] });
    await page.getByRole('button', { name: 'Reiniciar partida' }).tap();
    await page.waitForTimeout(100);
    assert.equal((await state(page)).hearts, 5);
    const completion = await page.evaluate(async () => {
      const { game } = await import(document.querySelector('script[src*="/src/main.ts"]').src);
      const scene = game.scene.getScene('Game');
      scene.player.x = 240 + 195 * 0.8;
      for (let i = 0; i < 650 && !scene.run.ended; i++) scene.update(i * 50, 50);
      return { won: scene.run.won, progress: scene.run.progress, hearts: scene.run.hearts, count: scene.children.length };
    });
    assert.equal(completion.won, true);
    assert.equal(completion.progress, 300);
    assert.equal(completion.hearts, 5);
    assert.ok(completion.count < 150, 'escenario con número acotado de objetos');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}x${height}: pantalla completa, arrastre, pausa horizontal, estrellas, potenciador, cinco vidas y meta`);
    await context.close();
  }
} finally { await browser.close(); }

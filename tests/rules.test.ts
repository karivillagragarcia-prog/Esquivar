import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPlayer, difficulty, overlaps, WIDTH, PLAYER_SIZE } from '../src/game/rules';

test('el jugador permanece dentro de la pantalla', () => {
  assert.equal(clampPlayer(-100), PLAYER_SIZE / 2);
  assert.equal(clampPlayer(1000), WIDTH - PLAYER_SIZE / 2);
  assert.equal(clampPlayer(240), 240);
});
test('las colisiones distinguen contacto, separación y solapamiento', () => {
  assert.equal(overlaps(100, 100, 100, 100), true);
  assert.equal(overlaps(100, 100, 130, 130), true);
  assert.equal(overlaps(100, 100, 131, 100), false);
  assert.equal(overlaps(100, 100, 100, 200), false);
});
test('la dificultad aumenta y respeta los límites', () => {
  assert.deepEqual(difficulty(-1), difficulty(0));
  assert.ok(difficulty(30).speed > difficulty(0).speed);
  assert.ok(difficulty(30).interval < difficulty(0).interval);
  assert.deepEqual(difficulty(1000), { speed: 480, interval: 260 });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, advanceRun, MAX_HEARTS, BOOSTS, STARS } from '../src/game/run';
import { LEVEL_ONE, LEVEL_LENGTH } from '../src/game/rules';

test('cinco vidas como máximo y un daño por obstáculo aunque dure varios fotogramas', () => {
  const run = createRun(99);
  assert.equal(run.hearts, MAX_HEARTS);
  run.progress = LEVEL_ONE[0].distance - 1.5;
  for (let i = 0; i < 10; i++) advanceRun(run, LEVEL_ONE[0].lane, 0.05);
  assert.equal(run.hearts, MAX_HEARTS - 1);
  assert.equal(run.impacts.size, 1);
  assert.equal(run.ended, false);
});
test('la quinta colisión termina la partida y reiniciar restaura las vidas', () => {
  const run = createRun();
  for (const obstacle of LEVEL_ONE.slice(0, 5)) {
    run.progress = obstacle.distance - 1.5;
    advanceRun(run, obstacle.lane, 0.05);
  }
  assert.equal(run.hearts, 0);
  assert.equal(run.ended, true);
  assert.equal(run.won, false);
  assert.equal(createRun().hearts, 5);
  assert.equal(createRun().collected.size, 0);
});
test('la estrella se recoge una vez y exige estar en el mismo carril', () => {
  const run = createRun();
  const star = STARS[0];
  run.progress = star.distance - 1.5;
  assert.deepEqual(advanceRun(run, -star.lane, 0.05), []);
  assert.equal(run.stars, 0);
  for (let i = 0; i < 5; i++) advanceRun(run, star.lane, 0.05);
  assert.equal(run.stars, 1);
  assert.equal(run.collected.size, 1);
});
test('el potenciador duplica estrellas durante diez segundos sin cambiar la velocidad', () => {
  const run = createRun();
  run.progress = BOOSTS[0].distance - 1.5;
  const previous = run.progress;
  advanceRun(run, BOOSTS[0].lane, 0.05);
  assert.equal(run.progress - previous, 0.5);
  assert.equal(run.boostUntil - run.progress, 100);
  run.progress = STARS[3].distance - 1.5;
  advanceRun(run, STARS[3].lane, 0.05);
  assert.equal(run.stars, 2);
  run.progress = STARS[6].distance - 1.5;
  advanceRun(run, STARS[6].lane, 0.05);
  assert.equal(run.stars, 3);
});
test('la ruta original se completa esquivando y un intervalo largo no causa un salto', () => {
  const run = createRun();
  advanceRun(run, 0.8, 9);
  assert.equal(run.progress, 0.5);
  for (let i = 0; i < 650 && !run.ended; i++) advanceRun(run, 0.8, 0.05);
  assert.equal(run.progress, LEVEL_LENGTH);
  assert.equal(run.won, true);
  assert.equal(run.hearts, 5);
});

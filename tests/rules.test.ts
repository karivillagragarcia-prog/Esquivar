import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPlayer, playerLane, project, hitsObstacle, LEVEL_ONE, LEVEL_LENGTH, FORWARD_SPEED, WIDTH, PLAYER_Y, ROAD_HALF_WIDTH, BALL_RADIUS, viewLayout } from '../src/game/rules';

test('la pelota permanece dentro de la plataforma, incluyendo su radio', () => {
  assert.equal(clampPlayer(-100), WIDTH / 2 - ROAD_HALF_WIDTH + BALL_RADIUS);
  assert.equal(clampPlayer(1000), WIDTH / 2 + ROAD_HALF_WIDTH - BALL_RADIUS);
  assert.equal(playerLane(WIDTH / 2), 0);
});
test('la perspectiva acerca los objetos sobre el suelo y aumenta su tamaño', () => {
  const far = project(0.55, 80), near = project(0.55, 10);
  assert.ok(near.y > far.y && near.scale > far.scale && near.x > far.x);
  assert.equal(project(0, 0).y, PLAYER_Y);
  assert.equal(project(0, 0).x, WIDTH / 2);
});
test('la colisión usa la posición en la plataforma y el avance entre fotogramas', () => {
  const obstacle = LEVEL_ONE[0];
  assert.equal(hitsObstacle(-0.55, 40, 43, obstacle), true);
  assert.equal(hitsObstacle(0.55, 40, 43, obstacle), false);
  assert.equal(hitsObstacle(-0.55, 10, 11, obstacle), false);
  assert.equal(hitsObstacle(-0.55, 44, 45, obstacle), false);
});
test('el nivel fácil ofrece tiempo de reacción y un paso libre en cada fila', () => {
  assert.ok(LEVEL_ONE[0].distance / FORWARD_SPEED >= 4);
  for (let i = 0; i < LEVEL_ONE.length; i++) {
    const obstacle = LEVEL_ONE[i];
    assert.ok(obstacle.distance < LEVEL_LENGTH);
    if (i) assert.ok((obstacle.distance - LEVEL_ONE[i - 1].distance) / FORWARD_SPEED >= 3);
    const freeLane = obstacle.lane <= 0 ? 0.7 : -0.7;
    assert.equal(hitsObstacle(freeLane, obstacle.distance - 1, obstacle.distance + 1, obstacle), false);
  }
});

test('la perspectiva conserva carriles y escala horizontal al cambiar la altura', () => {
  const layouts = [viewLayout(720), viewLayout(1100)];
  for (const layout of layouts) {
    assert.equal(project(0, 0, layout).y, layout.height * 0.84);
    assert.ok(project(0, 90, layout).y < project(0, 10, layout).y);
    assert.equal(project(0.55, 0, layout).x, 240 + 195 * 0.55);
  }
});

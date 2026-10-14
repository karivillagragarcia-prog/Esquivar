import { FORWARD_SPEED, LEVEL_LENGTH, LEVEL_ONE, hitsObstacle } from './rules';

export const MAX_HEARTS = 5;
// Cinco vidas; cada obstáculo puede dañar una única vez por partida.
export const STARTING_HEARTS = 5;
export const STARS = [
  { distance: 26, lane: 0.55 }, { distance: 58, lane: -0.55 },
  { distance: 90, lane: 0.55 }, { distance: 122, lane: 0.55 },
  { distance: 154, lane: -0.55 }, { distance: 186, lane: -0.55 },
  { distance: 218, lane: 0.55 }, { distance: 250, lane: -0.55 },
  { distance: 285, lane: 0 },
] as const;
export const BOOSTS = [{ distance: 110, lane: 0.55 }] as const;
export type RunState = {
  progress: number; hearts: number; stars: number; ended: boolean; won: boolean;
  boostUntil: number; collected: Set<number>; boosts: Set<number>; impacts: Set<number>;
};
export type RunEvent = { type: 'hit' | 'star' | 'boost'; lane: number; amount: number };
export function createRun(hearts = STARTING_HEARTS): RunState {
  return { progress: 0, hearts: Math.max(1, Math.min(MAX_HEARTS, Math.floor(hearts))), stars: 0, ended: false, won: false, boostUntil: 0, collected: new Set(), boosts: new Set(), impacts: new Set() };
}
export function advanceRun(run: RunState, lane: number, seconds: number): RunEvent[] {
  if (run.ended) return [];
  const previous = run.progress;
  run.progress = Math.min(LEVEL_LENGTH, previous + FORWARD_SPEED * Math.min(0.05, Math.max(0, seconds)));
  const events: RunEvent[] = [];
  for (const [index, obstacle] of LEVEL_ONE.entries()) {
    if (!run.impacts.has(index) && hitsObstacle(lane, previous, run.progress, obstacle)) {
      run.impacts.add(index);
      run.hearts--;
      events.push({ type: 'hit', lane: obstacle.lane, amount: 1 });
      if (run.hearts === 0) { run.ended = true; return events; }
    }
  }
  for (const [index, boost] of BOOSTS.entries()) {
    if (!run.boosts.has(index) && hitsObstacle(lane, previous, run.progress, boost)) {
      run.boosts.add(index);
      run.boostUntil = run.progress + FORWARD_SPEED * 10;
      events.push({ type: 'boost', lane: boost.lane, amount: 2 });
    }
  }
  for (const [index, star] of STARS.entries()) {
    if (!run.collected.has(index) && hitsObstacle(lane, previous, run.progress, star)) {
      run.collected.add(index);
      const amount = run.progress < run.boostUntil ? 2 : 1;
      run.stars += amount;
      events.push({ type: 'star', lane: star.lane, amount });
    }
  }
  if (run.progress === LEVEL_LENGTH) { run.won = true; run.ended = true; }
  return events;
}

export const WIDTH = 480;
export const HEIGHT = 640;
export const PLAYER_SIZE = 32;
export const OBSTACLE_SIZE = 30;
export function difficulty(seconds: number) {
  const elapsed = Math.max(0, seconds);
  return { speed: Math.min(480, 180 + elapsed * 5), interval: Math.max(260, 850 - elapsed * 10) };
}
export function clampPlayer(x: number): number {
  return Math.max(PLAYER_SIZE / 2, Math.min(WIDTH - PLAYER_SIZE / 2, x));
}
export function overlaps(ax: number, ay: number, bx: number, by: number): boolean {
  const distance = (PLAYER_SIZE + OBSTACLE_SIZE) / 2;
  return Math.abs(ax - bx) < distance && Math.abs(ay - by) < distance;
}

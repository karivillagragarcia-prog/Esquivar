export const WIDTH = 480;
export const HEIGHT = 720;
export const HORIZON = 155;
export const PLAYER_Y = 610;
export const ROAD_HALF_WIDTH = 195;
export const VIEW_DISTANCE = 100;
export const LEVEL_LENGTH = 300;
export const FORWARD_SPEED = 10;
export const BALL_RADIUS = 22;
export type LevelObstacle = { distance: number; lane: number; color: number; kind: 'log' | 'root' | 'vine' };

// Distancias y carriles originales: un obstáculo por fila y un paso amplio.
export const LEVEL_ONE: readonly LevelObstacle[] = [
  { distance: 42, lane: -0.55, color: 0xc57a42, kind: 'log' },
  { distance: 74, lane: 0.55, color: 0x73bc39, kind: 'vine' },
  { distance: 106, lane: 0, color: 0xbc6b3c, kind: 'root' },
  { distance: 138, lane: -0.55, color: 0xc57a42, kind: 'log' },
  { distance: 170, lane: 0.55, color: 0x73bc39, kind: 'vine' },
  { distance: 202, lane: 0, color: 0xbc6b3c, kind: 'root' },
  { distance: 234, lane: -0.55, color: 0xc57a42, kind: 'log' },
  { distance: 266, lane: 0.55, color: 0x73bc39, kind: 'vine' },
];
export function clampPlayer(x: number): number {
  return Math.max(WIDTH / 2 - ROAD_HALF_WIDTH + BALL_RADIUS, Math.min(WIDTH / 2 + ROAD_HALF_WIDTH - BALL_RADIUS, x));
}
export function playerLane(x: number): number { return (clampPlayer(x) - WIDTH / 2) / ROAD_HALF_WIDTH; }
export type ViewLayout = { height: number; horizon: number; playerY: number };
export function viewLayout(height: number): ViewLayout {
  return { height, horizon: height * 0.15, playerY: height * 0.84 };
}
export function project(lane: number, distance: number, layout: ViewLayout = { height: HEIGHT, horizon: HORIZON, playerY: PLAYER_Y }) {
  const scale = Math.pow(Math.max(0, 1 - distance / VIEW_DISTANCE), 1.7);
  return { x: WIDTH / 2 + lane * ROAD_HALF_WIDTH * scale, y: layout.horizon + (layout.playerY - layout.horizon) * scale, scale };
}
export function hitsObstacle(lane: number, previous: number, next: number, obstacle: Pick<LevelObstacle, 'lane' | 'distance'>): boolean {
  return Math.abs(lane - obstacle.lane) < 0.24 && previous <= obstacle.distance + 1.2 && next >= obstacle.distance - 1.2;
}

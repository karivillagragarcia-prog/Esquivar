import Phaser from 'phaser';
import { App } from '@capacitor/app';
import { GameScene } from './scenes/GameScene';
import { WIDTH, HEIGHT } from './game/rules';
import './style.css';

const container = document.querySelector<HTMLElement>('#game')!;
const virtualHeight = () => WIDTH * container.clientHeight / Math.max(1, container.clientWidth);
export const game = new Phaser.Game({
  // Canvas 2D encaja con la ilustración y evita depender de WebGL en equipos modestos.
  type: Phaser.CANVAS,
  parent: container,
  backgroundColor: '#123e30',
  scale: { mode: Phaser.Scale.FIT, width: WIDTH, height: virtualHeight() || HEIGHT },
  scene: [GameScene],
  render: { antialias: true },
});
let appActive = true;
const updateActivity = () => {
  if (appActive && window.innerHeight >= window.innerWidth) game.resume();
  else game.pause();
};
const resize = () => {
  if (!game.isBooted) return;
  game.scale.getParentBounds();
  game.scale.setGameSize(WIDTH, virtualHeight());
  updateActivity();
};
new ResizeObserver(resize).observe(container);
window.addEventListener('resize', resize);
game.events.once(Phaser.Core.Events.READY, resize);
document.querySelector('#restart')?.addEventListener('click', () => game.scene.start('Game'));
void App.addListener('appStateChange', ({ isActive }) => { appActive = isActive; updateActivity(); });

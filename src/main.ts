import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { WIDTH, HEIGHT } from './game/rules';
import './style.css';
import { App } from '@capacitor/app';

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#17243a',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: WIDTH, height: HEIGHT },
  scene: [GameScene],
  render: { antialias: false },
});
document.querySelector('#restart')?.addEventListener('click', () => game.scene.start('Game'));

const container = document.querySelector('#game')!;
new ResizeObserver(() => {
  if (game.isBooted) {
    game.scale.getParentBounds();
    game.scale.refresh();
  }
}).observe(container);
void App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) game.resume();
  else game.pause();
});

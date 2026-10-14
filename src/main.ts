import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { WIDTH, HEIGHT } from './game/rules';
import './style.css';

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#17243a',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: WIDTH, height: HEIGHT },
  scene: [GameScene],
});
document.querySelector('#restart')?.addEventListener('click', () => game.scene.start('Game'));

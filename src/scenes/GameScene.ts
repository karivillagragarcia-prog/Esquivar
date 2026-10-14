import Phaser from 'phaser';
import { WIDTH, HEIGHT, PLAYER_SIZE, OBSTACLE_SIZE, clampPlayer, difficulty, overlaps } from '../game/rules';

type Obstacle = { shape: Phaser.GameObjects.Rectangle };
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private keys!: Record<'left' | 'right' | 'a' | 'd' | 'space', Phaser.Input.Keyboard.Key>;
  private obstacles: Obstacle[] = [];
  private elapsed = 0;
  private spawnElapsed = 0;
  private ended = false;

  constructor() { super('Game'); }

  create() {
    this.elapsed = 0;
    this.spawnElapsed = 0;
    this.ended = false;
    this.obstacles = [];
    this.player = this.add.rectangle(WIDTH / 2, HEIGHT - 60, PLAYER_SIZE, PLAYER_SIZE, 0x66ead2);
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontFamily: 'system-ui', fontSize: '22px', color: '#ffffff' }).setDepth(1);
    this.keys = this.input.keyboard!.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', space: 'SPACE' }) as typeof this.keys;
    const move = (pointer: Phaser.Input.Pointer) => {
      if (!this.ended) this.player.x = clampPlayer(pointer.x);
    };
    this.input.on('pointerdown', move);
    const drag = (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) move(pointer);
    };
    this.input.on('pointermove', drag);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', move);
      this.input.off('pointermove', drag);
    });
  }

  update(_time: number, rawDelta: number) {
    if (this.ended) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.scene.restart();
      return;
    }
    const delta = Math.min(rawDelta, 50);
    this.elapsed += delta / 1000;
    this.scoreText.setText(`Puntos: ${Math.floor(this.elapsed * 10)}`);
    const direction = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
    this.player.x = clampPlayer(this.player.x + direction * 320 * delta / 1000);
    const level = difficulty(this.elapsed);
    this.spawnElapsed += delta;
    if (this.spawnElapsed >= level.interval) {
      this.spawnElapsed -= level.interval;
      this.obstacles.push({ shape: this.add.rectangle(Phaser.Math.Between(OBSTACLE_SIZE / 2, WIDTH - OBSTACLE_SIZE / 2), -OBSTACLE_SIZE, OBSTACLE_SIZE, OBSTACLE_SIZE, 0xff7185) });
    }
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i].shape;
      obstacle.y += level.speed * delta / 1000;
      if (overlaps(this.player.x, this.player.y, obstacle.x, obstacle.y)) {
        this.ended = true;
        this.player.setFillStyle(0xffffff);
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, 180, 0x101827, 0.95).setDepth(2);
        this.add.text(WIDTH / 2, HEIGHT / 2, `Fin de la partida\nPuntos: ${Math.floor(this.elapsed * 10)}\nEspacio o botón para reiniciar`, { fontFamily: 'system-ui', fontSize: '22px', color: '#ffffff', align: 'center', lineSpacing: 12 }).setOrigin(0.5).setDepth(3);
        return;
      }
      if (obstacle.y > HEIGHT + OBSTACLE_SIZE) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }
}

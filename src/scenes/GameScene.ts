import Phaser from 'phaser';
import { WIDTH, HEIGHT, PLAYER_Y, BALL_RADIUS, VIEW_DISTANCE, LEVEL_LENGTH, FORWARD_SPEED, LEVEL_ONE, clampPlayer, playerLane, project, hitsObstacle } from '../game/rules';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private world!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private keys!: Record<'left' | 'right' | 'a' | 'd' | 'space', Phaser.Input.Keyboard.Key>;
  private elapsed = 0;
  private progress = 0;
  private ended = false;
  private won = false;
  private fingerX: number | null = null;

  constructor() { super('Game'); }

  create() {
    this.elapsed = 0;
    this.progress = 0;
    this.ended = false;
    this.won = false;
    this.fingerX = null;
    this.drawBackground();
    this.world = this.add.graphics();
    const shadow = this.add.ellipse(3, 12, 53, 19, 0x245b43, 0.3);
    const ball = this.add.circle(0, -BALL_RADIUS, BALL_RADIUS, 0xff334b).setStrokeStyle(2, 0xc31d43);
    const shade = this.add.arc(0, -BALL_RADIUS, BALL_RADIUS - 2, 15, 165, false, 0xdf2043);
    const glow = this.add.ellipse(-7, -BALL_RADIUS - 8, 14, 10, 0xffb4a8, 0.85).setAngle(-35);
    this.player = this.add.container(WIDTH / 2, PLAYER_Y, [shadow, ball, shade, glow]).setDepth(10);
    this.add.rectangle(WIDTH / 2, 51, WIDTH - 40, 76, 0xffffff, 0.95).setDepth(20).setStrokeStyle(2, 0xd8ffef);
    this.add.text(38, 25, 'NIVEL 1 · SELVA', { fontFamily: 'system-ui', fontSize: '19px', fontStyle: 'bold', color: '#135b66' }).setDepth(21);
    this.progressText = this.add.text(WIDTH - 38, 25, '0 %', { fontFamily: 'system-ui', fontSize: '19px', color: '#135b66' }).setOrigin(1, 0).setDepth(21);
    this.progressBar = this.add.graphics().setDepth(21);
    this.add.text(WIDTH / 2, 110, '¡Desliza y esquiva!', { fontFamily: 'system-ui', fontSize: '20px', fontStyle: 'bold', color: '#ffffff', stroke: '#168b9b', strokeThickness: 3 }).setOrigin(0.5).setDepth(21);
    this.keys = this.input.keyboard!.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', space: 'SPACE' }) as typeof this.keys;
    // Movimiento relativo: al apoyar el dedo la pelota no salta bajo la mano.
    const down = (pointer: Phaser.Input.Pointer) => { this.fingerX = pointer.x; };
    const drag = (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.ended && this.fingerX !== null) {
        this.player.x = clampPlayer(this.player.x + pointer.x - this.fingerX);
        this.fingerX = pointer.x;
      }
    };
    const up = () => { this.fingerX = null; };
    this.input.on('pointerdown', down);
    this.input.on('pointermove', drag);
    this.input.on('pointerup', up);
    this.input.on('pointerupoutside', up);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', down);
      this.input.off('pointermove', drag);
      this.input.off('pointerup', up);
      this.input.off('pointerupoutside', up);
    });
    this.drawWorld();
  }

  private drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x14634b).fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle(0xa5f5ae).fillRect(0, 0, WIDTH, 230);
    g.fillStyle(0xffec7b).fillCircle(370, 142, 33);
    // Capas de follaje que enmarcan el camino de la selva.
    for (let i = 0; i < 15; i++) {
      const x = i * 36 - 10;
      g.fillStyle(i % 2 ? 0x37b861 : 0x53d773).fillCircle(x, 206 + (i % 3) * 12, 46);
    }
    g.fillStyle(0x29934a).fillRect(0, 235, WIDTH, HEIGHT - 235);
    for (let i = 0; i < 7; i++) {
      for (const side of [-1, 1]) {
        const y = 235 + i * 74;
        const x = side < 0 ? 10 + (i % 2) * 16 : WIDTH - 10 - (i % 2) * 16;
        const size = 28 + i * 5;
        g.fillStyle(0x684634).fillRoundedRect(x - 6, y - 30, 12, 70, 4);
        g.fillStyle(0x0f7843).fillCircle(x, y - 45, size);
        g.fillStyle(0x21bd59).fillCircle(x - size * 0.45, y - 54, size * 0.75);
        g.fillStyle(0x65df67).fillCircle(x + size * 0.3, y - 68, size * 0.6);
        g.fillStyle(0xff5d9b).fillCircle(x + side * 20, y + 52, 6);
        g.fillStyle(0xffe754).fillCircle(x + side * 20, y + 52, 2);
      }
    }
  }

  private polygon(g: Phaser.GameObjects.Graphics, points: number[], color: number, alpha = 1) {
    g.fillStyle(color, alpha).beginPath().moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) g.lineTo(points[i], points[i + 1]);
    g.closePath().fillPath();
  }

  private drawWorld() {
    const g = this.world.clear();
    const farL = project(-1, 94), farR = project(1, 94);
    const nearL = project(-1, -12), nearR = project(1, -12);
    this.polygon(g, [farL.x, farL.y + 15, farR.x, farR.y + 15, nearR.x, nearR.y + 26, nearL.x, nearL.y + 26], 0x29ab80);
    this.polygon(g, [farL.x, farL.y, farR.x, farR.y, nearR.x, nearR.y, nearL.x, nearL.y], 0xaff03d);
    for (const side of [-1, 1]) {
      const a = project(side * 0.94, 94), b = project(side * 0.94, -12);
      this.polygon(g, [farL.x + (side === 1 ? farR.x - farL.x : 0), farL.y, a.x, a.y, b.x, b.y, side === 1 ? nearR.x : nearL.x, nearL.y], 0xfbd66b);
    }
    // Las marcas y los obstáculos avanzan sobre la superficie de la plataforma.
    for (let distance = 0; distance <= LEVEL_LENGTH + VIEW_DISTANCE; distance += 12) {
      const z = distance - this.progress;
      if (z < -10 || z > 94) continue;
      const a = project(-0.025, z), b = project(0.025, z - 3);
      const c = project(0.025, z), d = project(-0.025, z - 3);
      this.polygon(g, [a.x, a.y, c.x, c.y, b.x, b.y, d.x, d.y], 0xe5ff9d, 0.85);
    }
    const finishZ = LEVEL_LENGTH - this.progress;
    if (finishZ < 94 && finishZ > -10) {
      for (let row = 0; row < 2; row++) for (let col = 0; col < 10; col++) {
        const lane = -1 + col * 0.2;
        const a = project(lane, finishZ + row * 2), b = project(lane + 0.2, finishZ + row * 2);
        const c = project(lane + 0.2, finishZ + (row + 1) * 2), d = project(lane, finishZ + (row + 1) * 2);
        this.polygon(g, [a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y], (row + col) % 2 ? 0xffffff : 0x215d64);
      }
    }
    for (const obstacle of [...LEVEL_ONE].reverse()) {
      const z = obstacle.distance - this.progress;
      if (z < -5 || z > 94) continue;
      const p = project(obstacle.lane, z);
      const w = 50 * p.scale, h = 42 * p.scale, bevel = 12 * p.scale;
      g.fillStyle(0x376537, 0.25).fillEllipse(p.x + 7 * p.scale, p.y + 5 * p.scale, w * 1.3, 17 * p.scale);
      g.fillStyle(obstacle.color).fillRoundedRect(p.x - w / 2, p.y - h, w, h, 4 * p.scale);
      this.polygon(g, [p.x - w / 2, p.y - h, p.x - w / 2 + bevel, p.y - h - bevel, p.x + w / 2 + bevel, p.y - h - bevel, p.x + w / 2, p.y - h], 0xffffff, 0.45);
      this.polygon(g, [p.x + w / 2, p.y - h, p.x + w / 2 + bevel, p.y - h - bevel, p.x + w / 2 + bevel, p.y - bevel, p.x + w / 2, p.y], obstacle.color);
      g.fillStyle(0xffffff, 0.45).fillRoundedRect(p.x - w / 2 + 5 * p.scale, p.y - h + 6 * p.scale, 6 * p.scale, h * 0.65, 2 * p.scale);
    }
    this.progressBar.clear().fillStyle(0xdcefe7).fillRoundedRect(38, 61, WIDTH - 76, 10, 5);
    const ratio = Math.min(1, this.progress / LEVEL_LENGTH);
    if (ratio > 0) this.progressBar.fillStyle(0xff5271).fillRoundedRect(38, 61, (WIDTH - 76) * ratio, 10, 5);
    this.progressText.setText(`${Math.floor(ratio * 100)} %`);
  }

  private finish(won: boolean) {
    this.ended = true;
    this.won = won;
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH - 48, 210, 0xffffff, 0.97).setDepth(30).setStrokeStyle(3, won ? 0xaff03d : 0xff5271);
    this.add.text(WIDTH / 2, HEIGHT / 2 - 56, won ? '¡NIVEL COMPLETADO!' : '¡UPS! UN OBSTÁCULO', { fontFamily: 'system-ui', fontSize: '23px', fontStyle: 'bold', color: '#145b67' }).setOrigin(0.5).setDepth(31);
    this.add.text(WIDTH / 2, HEIGHT / 2 + 15, won ? '¡Muy bien! Llegaste a la meta.\nVuelve a jugar con el botón.' : 'Mueve la pelota hacia el paso libre.\nPulsa Reiniciar para intentarlo.', { fontFamily: 'system-ui', fontSize: '18px', color: '#387681', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(31);
  }

  update(_time: number, rawDelta: number) {
    if (this.ended) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.scene.restart();
      return;
    }
    const delta = Math.min(rawDelta, 50) / 1000;
    this.elapsed += delta;
    const direction = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
    this.player.x = clampPlayer(this.player.x + direction * 300 * delta);
    const previous = this.progress;
    this.progress = Math.min(LEVEL_LENGTH, previous + FORWARD_SPEED * delta);
    this.drawWorld();
    for (const obstacle of LEVEL_ONE) {
      if (hitsObstacle(playerLane(this.player.x), previous, this.progress, obstacle)) {
        this.finish(false);
        return;
      }
    }
    if (this.progress >= LEVEL_LENGTH) this.finish(true);
  }
}

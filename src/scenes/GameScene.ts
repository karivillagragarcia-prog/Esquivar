import Phaser from 'phaser';
import { WIDTH, BALL_RADIUS, playerLane, clampPlayer, viewLayout, type ViewLayout, LEVEL_LENGTH, FORWARD_SPEED } from '../game/rules';
import { advanceRun, createRun, MAX_HEARTS, type RunEvent, type RunState } from '../game/run';
import { JungleRenderer } from '../render/JungleRenderer';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private aura!: Phaser.GameObjects.Arc;
  private jungle!: JungleRenderer;
  private layout!: ViewLayout;
  private run!: RunState;
  private hearts: Phaser.GameObjects.Image[] = [];
  private starText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private boostText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private ending?: Phaser.GameObjects.Container;
  private keys!: Record<'left' | 'right' | 'a' | 'd' | 'space', Phaser.Input.Keyboard.Key>;
  private elapsed = 0;
  private fingerX: number | null = null;
  private lastHud = '';
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() { super('Game'); }

  create() {
    this.run = createRun();
    this.elapsed = 0;
    this.fingerX = null;
    this.lastHud = '';
    this.ending = undefined;
    this.layout = viewLayout(this.scale.gameSize.height);
    this.jungle = new JungleRenderer(this, this.layout);
    const shadow = this.add.ellipse(3, 8, 58, 17, 0x654928, 0.3);
    this.aura = this.add.circle(0, -BALL_RADIUS, 32).setStrokeStyle(3, 0xe2c5ff).setVisible(false);
    const ball = this.add.circle(0, -BALL_RADIUS, BALL_RADIUS, 0xff3d58).setStrokeStyle(2, 0xa92039);
    const shade = this.add.arc(0, -BALL_RADIUS, BALL_RADIUS - 2, 10, 165, false, 0xd72545);
    const glow = this.add.ellipse(-7, -BALL_RADIUS - 8, 14, 10, 0xffb4a8, 0.9).setAngle(-35);
    this.player = this.add.container(WIDTH / 2, this.layout.playerY, [shadow, this.aura, ball, shade, glow]);
    this.makeHud();
    const hint = this.add.text(WIDTH / 2, 125, 'DESLIZA PARA ESQUIVAR', { fontFamily: 'system-ui', fontSize: '17px', fontStyle: 'bold', color: '#ffffe3', stroke: '#28563d', strokeThickness: 4 }).setOrigin(0.5).setDepth(2100);
    this.tweens.add({ targets: hint, alpha: 0, delay: 2500, duration: 600, onComplete: () => hint.destroy() });
    this.keys = this.input.keyboard!.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', space: 'SPACE' }) as typeof this.keys;
    const down = (pointer: Phaser.Input.Pointer) => { this.fingerX = pointer.x; };
    const drag = (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.run.ended && this.fingerX !== null) {
        this.player.x = clampPlayer(this.player.x + pointer.x - this.fingerX);
        this.fingerX = pointer.x;
      }
    };
    const up = () => { this.fingerX = null; };
    this.input.on('pointerdown', down);
    this.input.on('pointermove', drag);
    this.input.on('pointerup', up);
    this.input.on('pointerupoutside', up);
    const resize = () => {
      this.layout = viewLayout(this.scale.gameSize.height);
      this.player.y = this.layout.playerY;
      this.jungle.resize(this.layout);
      this.ending?.setPosition(WIDTH / 2, this.layout.height / 2);
      this.draw();
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', down);
      this.input.off('pointermove', drag);
      this.input.off('pointerup', up);
      this.input.off('pointerupoutside', up);
      this.scale.off(Phaser.Scale.Events.RESIZE, resize);
    });
    this.draw();
  }

  private makeHud() {
    const g = this.add.graphics().setDepth(2000);
    g.fillStyle(0x0d3026, 0.22).fillRoundedRect(14, 17, WIDTH - 28, 93, 22);
    g.fillStyle(0x173e2e, 0.94).fillRoundedRect(12, 12, WIDTH - 24, 93, 20);
    g.lineStyle(1, 0xb6d592, 0.65).strokeRoundedRect(12, 12, WIDTH - 24, 93, 20);
    this.add.text(28, 23, '1 · SELVA TROPICAL', { fontFamily: 'system-ui', fontSize: '18px', fontStyle: 'bold', color: '#e6edbf' }).setDepth(2001);
    this.progressText = this.add.text(381, 24, '0 %', { fontFamily: 'system-ui', fontSize: '17px', color: '#d4e6aa' }).setOrigin(1, 0).setDepth(2001);
    this.hearts = Array.from({ length: MAX_HEARTS }, (_, i) => this.add.image(41 + i * 29, 64, 'jungle-heart').setDisplaySize(25, 25).setDepth(2001));
    this.add.image(218, 63, 'jungle-star').setDisplaySize(29, 29).setDepth(2001);
    this.starText = this.add.text(239, 47, '0', { fontFamily: 'system-ui', fontSize: '25px', fontStyle: 'bold', color: '#ffe480' }).setDepth(2001);
    this.boostText = this.add.text(301, 54, '', { fontFamily: 'system-ui', fontSize: '16px', fontStyle: 'bold', color: '#e2c5ff' }).setDepth(2001);
    this.progressBar = this.add.graphics().setDepth(2001);
  }

  private draw() {
    this.jungle.draw(this.run, this.elapsed);
    this.player.setDepth(this.layout.playerY + 1);
    const active = this.run.progress < this.run.boostUntil;
    this.aura.setVisible(active).setAlpha(this.reducedMotion ? 0.8 : 0.7 + Math.sin(this.elapsed * 6) * 0.2);
    const percent = Math.floor(this.run.progress / LEVEL_LENGTH * 100);
    const remaining = Math.max(0, Math.ceil((this.run.boostUntil - this.run.progress) / FORWARD_SPEED));
    const key = `${this.run.hearts}:${this.run.stars}:${percent}:${remaining}`;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.hearts.forEach((heart, i) => heart.setAlpha(i < this.run.hearts ? 1 : 0.22).setTint(i < this.run.hearts ? 0xffffff : 0x8aa38d));
    this.starText.setText(String(this.run.stars));
    this.progressText.setText(`${percent} %`);
    this.boostText.setText(active ? `×2 ${remaining}s` : '');
    this.progressBar.clear().fillStyle(0x385b3c).fillRoundedRect(28, 87, 354, 7, 3);
    if (percent > 0) this.progressBar.fillStyle(0xc5de6d).fillRoundedRect(28, 87, Math.max(7, 354 * percent / 100), 7, 3);
  }

  private effect(event: RunEvent) {
    if (event.type === 'hit') {
      if (!this.reducedMotion) this.cameras.main.shake(100, 0.003);
      this.tweens.add({ targets: this.player, alpha: 0.4, duration: 90, yoyo: true, repeat: 2 });
      return;
    }
    const color = event.type === 'boost' ? '#e6c8ff' : '#fff2a3';
    const text = this.add.text(this.player.x, this.player.y - 85, event.type === 'boost' ? 'ESTRELLAS ×2' : `+${event.amount} ★`, { fontFamily: 'system-ui', fontSize: '21px', fontStyle: 'bold', color, stroke: '#394c2e', strokeThickness: 4 }).setOrigin(0.5).setDepth(1900);
    this.tweens.add({ targets: text, y: text.y - 45, alpha: 0, duration: 750, onComplete: () => text.destroy() });
    if (this.reducedMotion) return;
    for (let i = 0; i < 7; i++) {
      const spark = this.add.image(this.player.x, this.player.y - BALL_RADIUS, 'jungle-spark').setDepth(1900);
      const angle = i * Math.PI * 2 / 7;
      this.tweens.add({ targets: spark, x: spark.x + Math.cos(angle) * 50, y: spark.y + Math.sin(angle) * 50 - 20, alpha: 0, scale: 0.3, duration: 450, onComplete: () => spark.destroy() });
    }
  }

  private finish() {
    const won = this.run.won;
    const panel = this.add.graphics();
    panel.fillStyle(0x153e2e, 0.97).fillRoundedRect(-204, -112, 408, 224, 24);
    panel.lineStyle(2, 0xcfe297).strokeRoundedRect(-204, -112, 408, 224, 24);
    const title = this.add.text(0, -69, won ? '¡NIVEL COMPLETADO!' : '¡INTÉNTALO OTRA VEZ!', { fontFamily: 'system-ui', fontSize: '23px', fontStyle: 'bold', color: '#fff2aa' }).setOrigin(0.5);
    const message = this.add.text(0, -10, `${this.run.stars} estrellas recogidas\n${won ? '¡Llegaste a la meta!' : 'Busca el paso libre entre obstáculos.'}`, { fontFamily: 'system-ui', fontSize: '19px', color: '#deedc6', align: 'center', lineSpacing: 10 }).setOrigin(0.5);
    const button = this.add.rectangle(0, 69, 280, 58, 0xffde72).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.restart());
    const label = this.add.text(0, 69, 'VOLVER A JUGAR', { fontFamily: 'system-ui', fontSize: '19px', fontStyle: 'bold', color: '#254b31' }).setOrigin(0.5);
    this.ending = this.add.container(WIDTH / 2, this.layout.height / 2, [panel, title, message, button, label]).setDepth(3000);
  }

  update(_time: number, rawDelta: number) {
    if (this.run.ended) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.scene.restart();
      return;
    }
    const delta = Math.min(rawDelta, 50) / 1000;
    this.elapsed += delta;
    const direction = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
    this.player.x = clampPlayer(this.player.x + direction * 300 * delta);
    for (const event of advanceRun(this.run, playerLane(this.player.x), delta)) this.effect(event);
    this.draw();
    if (this.run.ended) this.finish();
  }
}

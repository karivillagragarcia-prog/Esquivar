import Phaser from 'phaser';
import { LEVEL_LENGTH, LEVEL_ONE, WIDTH, project, type ViewLayout } from '../game/rules';
import { BOOSTS, STARS, type RunState } from '../game/run';

const polygon = (g: Phaser.GameObjects.Graphics, points: number[], color: number, alpha = 1) => {
  g.fillStyle(color, alpha).beginPath().moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) g.lineTo(points[i], points[i + 1]);
  g.closePath().fillPath();
};
const leaf = (g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number, flip = 1) => {
  polygon(g, [x, y, x + size * 0.3 * flip, y - size * 0.8, x + size * flip, y - size, x + size * 0.75 * flip, y - size * 0.2], color);
  g.lineStyle(1.5, 0xb4df75, 0.4).lineBetween(x, y, x + size * 0.8 * flip, y - size * 0.75);
};

function makeTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('jungle-log')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const save = (name: string, w: number, h: number) => { g.generateTexture(name, w, h); g.clear(); };
  // Tronco: corte claro con anillos, corteza rugosa y musgo.
  g.fillStyle(0x542e21).fillRoundedRect(16, 80, 95, 71, 13);
  g.fillStyle(0xa76538).fillRoundedRect(18, 73, 90, 65, 14);
  for (let i = 0; i < 5; i++) g.lineStyle(4, i % 2 ? 0x7b4028 : 0xce8b4b).lineBetween(31 + i * 14, 78, 25 + i * 14, 126);
  g.fillStyle(0xf1be74).fillEllipse(104, 107, 27, 66);
  g.lineStyle(3, 0xad713e).strokeEllipse(104, 107, 18, 48).strokeEllipse(104, 107, 9, 26);
  g.fillStyle(0x83b946).fillRoundedRect(25, 74, 61, 10, 5);
  leaf(g, 51, 77, 20, 0x98cf4b);
  save('jungle-log', 128, 160);
  // Raíz gruesa: parte central elevada y tres apoyos en el suelo.
  polygon(g, [16, 146, 27, 112, 49, 104, 44, 76, 62, 68, 82, 107, 108, 118, 114, 147, 95, 141, 80, 121, 67, 118, 66, 149, 52, 149, 48, 122, 37, 127, 30, 146], 0x673c28);
  polygon(g, [21, 141, 32, 116, 56, 107, 50, 81, 61, 77, 73, 112, 104, 126, 108, 143, 96, 135, 78, 115, 61, 113, 58, 143, 53, 141, 53, 119, 34, 122], 0xba7943);
  g.lineStyle(3, 0xe3ae66).lineBetween(57, 83, 64, 105).lineBetween(34, 121, 23, 141);
  g.fillStyle(0x7da642).fillEllipse(64, 78, 23, 12);
  leaf(g, 72, 112, 18, 0x91c747);
  save('jungle-root', 128, 160);
  // Liana que nace del suelo y se enrosca sobre sí misma.
  g.lineStyle(23, 0x2a5132).beginPath().moveTo(37, 145).lineTo(47, 118).lineTo(76, 96).lineTo(85, 66).lineTo(70, 44).lineTo(44, 48).lineTo(35, 70).lineTo(50, 92).lineTo(80, 123).lineTo(90, 145).strokePath();
  g.lineStyle(15, 0x67a943).beginPath().moveTo(37, 145).lineTo(47, 118).lineTo(76, 96).lineTo(85, 66).lineTo(70, 44).lineTo(44, 48).lineTo(35, 70).lineTo(50, 92).lineTo(80, 123).lineTo(90, 145).strokePath();
  g.lineStyle(4, 0xb5d465).lineBetween(48, 119, 76, 96).lineBetween(85, 66, 71, 46);
  for (const [x, y, flip] of [[35, 72, -1], [82, 76, 1], [47, 120, -1]]) leaf(g, x, y, 24, 0x7fc54a, flip);
  save('jungle-vine', 128, 160);
  // Estrella con contorno cálido: nunca comparte colores con los obstáculos.
  const star = (cx: number, cy: number, radius: number, color: number) => {
    const points: number[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? radius * 0.46 : radius;
      points.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
    polygon(g, points, color);
  };
  star(40, 43, 35, 0xad6526); star(40, 39, 32, 0xfff4a7); star(40, 39, 27, 0xffcf37);
  polygon(g, [40, 13, 40, 39, 17, 31, 30, 29], 0xfff8c7);
  save('jungle-star', 80, 80);
  g.lineStyle(4, 0xeffffe).strokeCircle(40, 40, 31);
  g.fillStyle(0x8b5ce3).fillCircle(40, 40, 28);
  polygon(g, [44, 13, 24, 44, 38, 43, 34, 64, 58, 32, 43, 34], 0xffee79);
  save('jungle-boost', 80, 80);
  g.fillStyle(0xff6476).fillCircle(12, 11, 10).fillCircle(28, 11, 10);
  polygon(g, [2, 14, 38, 14, 20, 36], 0xff6476);
  g.fillStyle(0xffbac0).fillEllipse(9, 7, 7, 4);
  save('jungle-heart', 40, 40);
  g.fillStyle(0xffe480).fillCircle(8, 8, 5);
  save('jungle-spark', 16, 16);
  // Hoja decorativa: textura reutilizada, animada sin redibujar el follaje.
  leaf(g, 45, 100, 83, 0x34935a, -1);
  leaf(g, 45, 100, 72, 0x78c453, 1);
  leaf(g, 45, 100, 57, 0xa6d566, -1);
  save('jungle-leaf', 128, 128);
  g.destroy();
}

type Patch = { distance: number; lane: number; size: number; stone: boolean };
export class JungleRenderer {
  private background: Phaser.GameObjects.Graphics;
  private backdrop?: Phaser.GameObjects.Image;
  private terrain: Phaser.GameObjects.Graphics;
  private leaves: Phaser.GameObjects.Image[] = [];
  private obstacles: Phaser.GameObjects.Image[];
  private shadows: Phaser.GameObjects.Ellipse[];
  private stars: Phaser.GameObjects.Image[];
  private boosts: Phaser.GameObjects.Image[];
  private patches: Patch[] = [];
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private scene: Phaser.Scene, private layout: ViewLayout) {
    makeTextures(scene);
    this.background = scene.make.graphics({ x: 0, y: 0 });
    this.terrain = scene.add.graphics().setDepth(-10);
    this.obstacles = LEVEL_ONE.map(o => scene.add.image(0, 0, `jungle-${o.kind}`).setOrigin(0.5, 0.92));
    this.shadows = LEVEL_ONE.map(() => scene.add.ellipse(0, 0, 1, 1, 0x372c17, 0.28));
    this.stars = STARS.map(() => scene.add.image(0, 0, 'jungle-star').setOrigin(0.5, 0.8));
    this.boosts = BOOSTS.map(() => scene.add.image(0, 0, 'jungle-boost').setOrigin(0.5, 0.85));
    for (let i = 0; i < 10; i++) this.leaves.push(scene.add.image(0, 0, 'jungle-leaf').setOrigin(0.35, 0.8).setDepth(800));
    for (let i = 0; i < 180; i++) this.patches.push({ distance: i * 2.3, lane: Math.sin(i * 13.7) * 0.83, size: 2 + i % 5, stone: i % 5 === 0 });
    this.resize(layout);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.background.destroy());
  }

  resize(layout: ViewLayout) {
    this.layout = layout;
    this.drawBackground();
    this.leaves.forEach((image, i) => {
      const side = i % 2 ? 1 : -1;
      const depth = Math.floor(i / 2);
      image.setPosition(side < 0 ? -12 : WIDTH + 12, layout.horizon + (layout.height - layout.horizon) * (0.1 + depth * 0.22));
      image.setFlipX(side > 0).setScale(0.45 + depth * 0.19);
    });
  }

  private drawBackground() {
    const g = this.background.clear(), h = this.layout.height;
    // El fondo se dibuja solo al cambiar el tamaño de la pantalla.
    for (let i = 0; i < 24; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(new Phaser.Display.Color(178, 225, 137), new Phaser.Display.Color(18, 67, 46), 23, i);
      g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b)).fillRect(0, h * i / 24, WIDTH, h / 24 + 1);
    }
    g.fillStyle(0xfff1a5, 0.45).fillEllipse(284, this.layout.horizon * 1.2, 200, 150);
    for (let layer = 0; layer < 3; layer++) {
      const base = this.layout.horizon + layer * h * 0.065;
      for (let i = 0; i < 14; i++) {
        const x = i * 40 - 15 + layer * 9;
        const top = 18 + (i % 4) * 19;
        g.fillStyle([0x8ac681, 0x59a66a, 0x337a51][layer], 0.85).fillRoundedRect(x, top, 11 + layer * 3, base - top, 5);
        g.fillEllipse(x, top + 30, 65 + layer * 9, 90).fillCircle(x - 15, base - 15, 43);
      }
    }
    // Troncos y helechos laterales en varias capas de profundidad.
    for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
      const ratio = 0.23 + i * 0.16, y = h * ratio + (side > 0 ? 15 + i * 4 : 0);
      const road = project(side, 70 - i * 17, this.layout);
      const x = side < 0 ? Math.min(34, road.x - 48) : Math.max(WIDTH - 34, road.x + 48);
      const size = 28 + i * 12 + (side > 0 ? (i % 3) * 5 : 0);
      g.fillStyle(0x183e2d, 0.4).fillEllipse(x + side * 14, y + size, size * 2.3, size * 0.55);
      g.fillStyle(0x503d28).fillRoundedRect(x - size * 0.16, y - size * 1.6, size * 0.35, size * 2.6, 6);
      g.fillStyle(0xa27948, 0.65).fillRect(x - size * 0.05, y - size * 1.45, size * 0.08, size * 2.3);
      g.lineStyle(2, 0x312f1d, 0.65).lineBetween(x + 4, y - size * 1.3, x + 4, y + size * 0.8);
      for (let j = 0; j < 5; j++) {
        g.fillStyle([0x184f37, 0x267d48, 0x50a653][j % 3]).fillEllipse(x + Math.sin(j * 3) * size * 0.8, y - size * (1.2 + j * 0.15), size * 1.7, size);
      }
      for (let j = 0; j < 5; j++) leaf(g, x, y + size, size * (0.8 + j * 0.07), j % 2 ? 0x3c9856 : 0x73ba54, j % 2 ? 1 : -1);
      g.fillStyle(0xf695a5).fillCircle(x - side * size * 0.5, y + size, 4 + i * 0.5);
      g.fillStyle(0xffe284).fillCircle(x - side * size * 0.5, y + size, 2);
    }
    for (const side of [-1, 1]) {
      const x = side < 0 ? 20 : WIDTH - 20;
      g.lineStyle(5, 0x35592f).beginPath().moveTo(x, 0).lineTo(x + side * 7, h * 0.12).lineTo(x - side * 3, h * 0.2).strokePath();
      for (let i = 0; i < 5; i++) leaf(g, x, h * (0.04 + i * 0.025), 17, 0x63a64e, i % 2 ? 1 : -1);
    }
    // Una sola textura para el fondo: no se renderizan cientos de vectores por fotograma.
    if (this.scene.textures.exists('jungle-backdrop')) this.scene.textures.remove('jungle-backdrop');
    g.generateTexture('jungle-backdrop', WIDTH, Math.ceil(h));
    if (this.backdrop) this.backdrop.setTexture('jungle-backdrop');
    else this.backdrop = this.scene.add.image(0, 0, 'jungle-backdrop').setOrigin(0).setDepth(-20);
    g.clear();
  }

  draw(run: RunState, time: number) {
    const g = this.terrain.clear(), layout = this.layout;
    const p = (lane: number, z: number) => project(lane, z, layout);
    const quad = (left: number, right: number, far: number, near: number, color: number, alpha = 1) => {
      const a = p(left, far), b = p(right, far), c = p(right, near), d = p(left, near);
      polygon(g, [a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y], color, alpha);
    };
    quad(-1.07, 1.07, 94, -20, 0x132f20, 0.55);
    quad(-1.02, 1.02, 94, -20, 0x734a2a);
    quad(-1, 1, 94, -20, 0xc49d58);
    quad(-0.9, 0.9, 94, -20, 0xdab575);
    quad(-0.74, 0.74, 94, -20, 0xe2be82, 0.5);
    for (const side of [-1, 1]) quad(side < 0 ? -1 : 0.92, side < 0 ? -0.92 : 1, 94, -20, 0x5f973e);
    for (const patch of this.patches) {
      const z = patch.distance - run.progress;
      if (z < -18 || z > 92) continue;
      const at = p(patch.lane, z), s = at.scale;
      if (patch.stone) {
        g.fillStyle(0x806f4a, 0.35).fillEllipse(at.x + s, at.y + s, patch.size * s * 2.1, patch.size * s);
        g.fillStyle(0xb3aa86).fillEllipse(at.x, at.y, patch.size * s * 1.8, patch.size * s * 0.9);
        g.fillStyle(0xe1d3a4).fillEllipse(at.x - s, at.y - s, patch.size * s, patch.size * s * 0.4);
      } else {
        g.fillStyle(0xa17742, 0.25).fillEllipse(at.x, at.y, patch.size * s * 3, patch.size * s * 0.65);
      }
    }
    // Las raíces decorativas permanecen en los bordes del sendero.
    for (let distance = 0; distance < 410; distance += 9) {
      const z = distance - run.progress;
      if (z < -16 || z > 92) continue;
      for (const side of [-1, 1]) {
        const at = p(side * 0.98, z), s = at.scale;
        g.lineStyle(3 * s, 0x867044, 0.7).lineBetween(at.x, at.y, at.x - side * 7 * s, at.y + 5 * s);
        leaf(g, at.x, at.y, 14 * s, distance % 2 ? 0x6fa641 : 0x8aba50, side);
      }
    }
    const finish = LEVEL_LENGTH - run.progress;
    if (finish < 94) for (let row = 0; row < 2; row++) for (let col = 0; col < 10; col++) quad(-1 + col * 0.2, -0.8 + col * 0.2, finish + (row + 1) * 2, finish + row * 2, (row + col) % 2 ? 0xf8e9c9 : 0x3b573b);
    this.obstacles.forEach((image, i) => {
      const obstacle = LEVEL_ONE[i], z = obstacle.distance - run.progress, at = p(obstacle.lane, z);
      const visible = z > -8 && z < 94;
      image.setVisible(visible).setPosition(at.x, at.y).setScale(at.scale * 0.52).setDepth(at.y);
      // La liana crece desde el suelo sin mover su zona de colisión.
      if (obstacle.kind === 'vine' && !this.reducedMotion) image.setScale(at.scale * 0.52, at.scale * 0.52 * (1 + Math.sin(time * 1.8 + i) * 0.025));
      this.shadows[i].setVisible(visible).setPosition(at.x + 5 * at.scale, at.y + 4 * at.scale).setDisplaySize(65 * at.scale, 18 * at.scale).setDepth(at.y - 0.1);
      image.setAlpha(run.impacts.has(i) ? 0.5 : 1);
    });
    this.stars.forEach((image, i) => {
      const item = STARS[i], z = item.distance - run.progress, at = p(item.lane, z);
      image.setVisible(z > -5 && z < 94 && !run.collected.has(i)).setPosition(at.x, at.y - 8 * at.scale).setScale(at.scale * 0.48).setDepth(at.y + 0.5);
      if (!this.reducedMotion) image.setScale(at.scale * 0.48 * (0.86 + Math.sin(time * 3 + i) * 0.14), at.scale * 0.48).setAngle(Math.sin(time * 2 + i) * 8);
    });
    this.boosts.forEach((image, i) => {
      const item = BOOSTS[i], z = item.distance - run.progress, at = p(item.lane, z);
      const pulse = this.reducedMotion ? 1 : 1 + Math.sin(time * 4) * 0.08;
      image.setVisible(z > -5 && z < 94 && !run.boosts.has(i)).setPosition(at.x, at.y - 10 * at.scale).setScale(at.scale * 0.55 * pulse).setDepth(at.y + 0.5);
    });
    if (!this.reducedMotion) this.leaves.forEach((image, i) => image.setAngle(Math.sin(time * 0.75 + i * 1.3) * 4));
  }
}

import * as Phaser from 'phaser';
import { ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS } from './common';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  public preload(): void {
    this.load.image(ASSET_KEYS.TITLE, 'assets/images/title.png');
    this.load.image(ASSET_KEYS.CLICK_TO_START, 'assets/images/clickToStart.png');
    this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards.png', {
      frameWidth: CARD_WIDTH,
      frameHeight: CARD_HEIGHT,
      spacing: 2,
      margin: 1,
    });
  }

  public create(): void {
    // TODO got to .TITLE when start screen design
    this.scene.start(SCENE_KEYS.GAME);
  }
}

import * as Phaser from 'phaser';
import { ASSET_KEYS, AUDIO_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS } from './common';
import { UI_CONFIG } from './common';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  public preload(): void {
    this.load.image(ASSET_KEYS.PARTICLE, 'assets/images/particle.png');
    this.load.image(ASSET_KEYS.TABLE_BACKGROUND, 'assets/images/green-felt.png');
    this.load.image(ASSET_KEYS.TITLE, 'assets/images/title.png');
    this.load.image(ASSET_KEYS.CLICK_TO_START, 'assets/images/clickToStart.png');

    // this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards_edge-0.png', {
    this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards_edge-0_alias-4.png', {
      frameWidth: CARD_WIDTH,
      frameHeight: CARD_HEIGHT,
      spacing: 1,
      margin: 1,
    });
    // this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards_edge-0_scale-4.png', {
    //   frameWidth: 224, // CARD_WIDTH,
    //   frameHeight: 312, //CARD_HEIGHT,
    //   spacing: 4,  //2,
    //   margin: 4,   //1,
    // });
    
    this.load.audio(AUDIO_KEYS.DRAW_CARD, 'assets/audio/placeholder.ogg');
    this.load.audio(AUDIO_KEYS.FOUNDATION_ADD, 'assets/audio/placeholder.ogg');

  }

  public create(): void {
    if (UI_CONFIG.skipTitleScene) {
      this.scene.start(SCENE_KEYS.GAME);
    } else {
      this.scene.start(SCENE_KEYS.TITLE);
    }

  }
}

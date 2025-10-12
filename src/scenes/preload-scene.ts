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

    this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards_edge-0-top-1_scale-2.png', { 
      // 56x78, from 2x blanks
      frameWidth: CARD_WIDTH,
      frameHeight: CARD_HEIGHT,
      spacing: 1 * UI_CONFIG.scale,
      margin: 1 * UI_CONFIG.scale,
    });
    
    this.load.audio(AUDIO_KEYS.DRAW_CARD, 'assets/audio/card-pick-up.ogg');
    this.load.audio(AUDIO_KEYS.FOUNDATION_ADD, 'assets/audio/card-put-down.ogg');
    this.load.audio(AUDIO_KEYS.PLACE_CARD, 'assets/audio/card-put-down.ogg');
    this.load.audio(AUDIO_KEYS.SHUFFLE_DECK, 'assets/audio/card-shuffle.ogg');
    this.load.audio(AUDIO_KEYS.GAME_WIN, 'assets/audio/win-sound.ogg');

  }

  public create(): void {
    if (UI_CONFIG.skipTitleScene) {
      this.scene.start(SCENE_KEYS.GAME);
    } else {
      this.scene.start(SCENE_KEYS.TITLE);
    }

  }
}

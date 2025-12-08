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
    this.load.image(ASSET_KEYS.CLICK_TO_START, 'assets/images/clickToStart.png');
    this.load.image(ASSET_KEYS.PLAY_MEDALLION, 'assets/images/play_medallion.png');

    this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/images/cards_corner-7_side-1-top-1-base-1_scale-2.png', {
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
    this.load.audio(AUDIO_KEYS.INVALID, 'assets/audio/invalid-move.ogg');
    this.load.audio(AUDIO_KEYS.EASY_MOVE, 'assets/audio/cheat-quack.ogg');
    this.load.audio(AUDIO_KEYS.BUTTON_PRESS, 'assets/audio/button-press.ogg');
    this.load.audio(AUDIO_KEYS.REWIND, 'assets/audio/rewind.ogg');
    this.load.audio(AUDIO_KEYS.FOUNDATION_PILE_COMPLETED, 'assets/audio/foundation-pile-completed.ogg');
    this.load.audio(AUDIO_KEYS.FOUNDATION_PILE_ADDED, 'assets/audio/foundation-pile-added.ogg');
    this.load.audio(AUDIO_KEYS.MUSIC_GAME, 'assets/audio/music-talon-solitaire.ogg');

    const sfxVolume = parseInt(localStorage.getItem('talonSoundVolume') || '80', 10);
    this.sound.volume = sfxVolume / 100;
  }

  public create(): void {
    // const isTouchDevice = true; // for testing
    const isTouchDevice = this.sys.game.device.os.android ||
                        this.sys.game.device.os.iOS ||
                        this.sys.game.device.os.iPad ||
                        this.sys.game.device.os.iPhone;
    this.registry.set('isTouchDevice', isTouchDevice);

    if (UI_CONFIG.skipTitleScene) {
      this.scene.start(SCENE_KEYS.GAME);
      // this.scene.start(SCENE_KEYS.SCORES);
      // this.scene.start(SCENE_KEYS.HELP);
      // this.scene.start(SCENE_KEYS.MENU);
      // this.scene.start(SCENE_KEYS.CREDITS);
      // this.scene.start(SCENE_KEYS.SETTINGS);
    } else {
      this.scene.start(SCENE_KEYS.TITLE);
    }

  }
}

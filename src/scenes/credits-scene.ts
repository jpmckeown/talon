import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT  } from './common';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.CREDITS });
  }

  public create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a4d2a).setOrigin(0);

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Credits', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
    }).setOrigin(0.5);

    this.#addBackButton();
  }


  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'Back',
      {
        fontSize: `${24 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setColor('#00ff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => {
      this.scene.stop(SCENE_KEYS.CREDITS);
      this.scene.resume(SCENE_KEYS.GAME);
      this.scene.launch(SCENE_KEYS.MENU);
    });
  }
}

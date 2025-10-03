import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS } from './common';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    this.add.image(this.scale.width / 2, 100, ASSET_KEYS.TITLE, 0).setOrigin(0.5);

    const clickToStartImage = this.add.image(this.scale.width / 2, 250, ASSET_KEYS.CLICK_TO_START, 0);

    this.tweens.add({
      targets: clickToStartImage,
      alpha: {
        start: 1,
        from: 1,
        to: 0,
      },
      duration: 1000,
      repeat: -1,
      yoyo: true,
    });

    const tutorialContent = [
      "Draw new card by clicking top-left of screen.",
      "Drag card to any tableau, from another tableau stack or from draw.", 
      "Tableau allows card with next number down and opposite colour.",
      "Foundation piles top-right, one for each suit: begin with Ace.",
      "Score by adding cards to foundation and win by completing 4 suits.",
      "Keys: M to return here, S for high-scores, U to reveal, C for credits."
    ];

    this.add.text(100, 400, tutorialContent, { fontFamily: 'Arial', fontSize: 28, color: '#ffffff', lineSpacing: 32, align: 'left' })

    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.cameras.main.fadeOut(50, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENE_KEYS.GAME);
      });
    });

    this.input.keyboard!.on('keydown-S', () => {
      this.scene.start(SCENE_KEYS.SCORES);
    });
  }
}

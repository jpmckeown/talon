import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT } from './common';

export class HelpScene extends Phaser.Scene {
  #returnToScene: string = SCENE_KEYS.TITLE;

  constructor() {
    super({ key: SCENE_KEYS.HELP });
  }

  public create(data?: { from?: string }): void {
    if (data?.from) {
      this.#returnToScene = data.from;
    }

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a4d2a).setOrigin(0);

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'How to play', {
      fontSize: `${32 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const tutorialContent = [
      "Draw new card by clicking facedown stack top-left of screen.",
      "Drag card to any tableau, from another tableau stack or from draw.", 
      "Tableau allows card with next number down and opposite colour.",
      "Foundation piles top-right, one for each suit: begin with Ace.",
      "Score by adding cards to foundation and win by completing 4 suits.",
      "Keys: M for menu, U to reveal, Esc for beginning."
    ];

    this.add.text(100 * UI_CONFIG.scale, 150 * UI_CONFIG.scale, tutorialContent, { 
      fontFamily: 'Arial', 
      fontSize: `${20 * UI_CONFIG.scale}px`, 
      color: '#ffffff', 
      lineSpacing: 28 * UI_CONFIG.scale,
      align: 'left' 
    });

    this.#addBackButton();
  }


  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'back (B)',
      {
        fontSize: `${24 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setColor('#00ff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => this.#goBack());

    this.input.keyboard!.on('keydown-B', () => this.#goBack());
    this.input.keyboard!.on('keydown-M', () => this.#goBack());
  }


  #goBack(): void {
    this.scene.stop(SCENE_KEYS.HELP);
    if (this.#returnToScene === SCENE_KEYS.MENU) {
      this.scene.resume(SCENE_KEYS.GAME);
      this.scene.start(SCENE_KEYS.MENU);
    } else {
      this.scene.start(this.#returnToScene);
    }
  }
}

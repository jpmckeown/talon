import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT } from './common';

export class HelpScene extends Phaser.Scene {
  #returnToScene: string = SCENE_KEYS.MENU;
  #isTouchDevice!: boolean;

  constructor() {
    super({ key: SCENE_KEYS.HELP });
  }

  public create(data?: { from?: string }): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
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
      "Draw new card by clicking stack at top-left of screen.",
      "Drag card to a tableau from another tableau or from drawn.",
      "Tableau allows card with next number down and other colour; Easy mode allows a few same-colour placements. An empty tableau accepts any card (except ace). Each tableau is limited in length to stop cards going off the screen.",
      "Foundation piles top-right, one for each suit; begin with Ace; score by adding cards, and win by completing all suits.",
    ].join('\n\n');

    this.add.text(50 * UI_CONFIG.scale, 100 * UI_CONFIG.scale, tutorialContent, {
      fontFamily: 'Arial', 
      fontSize: `${20 * UI_CONFIG.scale}px`, 
      color: '#ffffff', 
      lineSpacing: 6 * UI_CONFIG.scale,
      wordWrap: { width: 590 * UI_CONFIG.scale, useAdvancedWrap: true },
      align: 'left'
    });

    this.#addBackButton();
  }


  #addBackButton(): void {
    const isReturningToTitle = this.#returnToScene === SCENE_KEYS.TITLE;
    const destination = isReturningToTitle ? 'Title' : 'Menu';
    const shortcutKey = isReturningToTitle ? 't' : 'm';

    const buttonText = this.#isTouchDevice
      ? `back to ${destination}`
      : `back to ${destination} (${shortcutKey})`;

    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      buttonText,
      {
        fontSize: `${18 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setColor('#00ff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => this.#goBack());

    if (isReturningToTitle) {
      this.input.keyboard!.on('keydown-T', () => this.#goBack());
    } else {
      this.input.keyboard!.on('keydown-M', () => this.#goBack());
    }
  }


  #goBack(): void {
    this.scene.stop(SCENE_KEYS.HELP);
    if (this.#returnToScene === SCENE_KEYS.MENU) {
      this.scene.start(SCENE_KEYS.MENU);
    } else {
      this.scene.start(this.#returnToScene);
    }
  }
}

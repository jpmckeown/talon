import * as Phaser from 'phaser';
import { ASSET_KEYS, CARD_BACK_OPTIONS, CARD_HEIGHT, CARD_WIDTH, DEFAULT_CARD_BACK_FRAME, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_CONFIG } from './common';


export class CardBackSelectorScene extends Phaser.Scene {
  #selectedFrame: number = DEFAULT_CARD_BACK_FRAME;
  #confirmationOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.CARD_BACK_SELECTOR });
  }


  public create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a4d2a).setOrigin(0);

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Choose Card Back', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const currentFrame = this.#loadCardBackPreference();
    this.#selectedFrame = currentFrame;

    this.#displayCardBackOptions();
    this.#addBackButton();
  }


  #loadCardBackPreference(): number {
    const saved = localStorage.getItem('solitaireCardBack');
    return saved ? parseInt(saved, 10) : DEFAULT_CARD_BACK_FRAME;
  }


  #saveCardBackPreference(frame: number): void {
    localStorage.setItem('solitaireCardBack', frame.toString());
  }


  #displayCardBackOptions(): void {
    const options = [
      { ...CARD_BACK_OPTIONS.BLANK_1, key: 'blank1' },
      { ...CARD_BACK_OPTIONS.BIRDS, key: 'birds' },
      { ...CARD_BACK_OPTIONS.FEATHERS, key: 'feathers' }
    ];

    const startX = this.scale.width / 2 - (CARD_WIDTH * 1.5 + 40 * UI_CONFIG.scale);
    const cardY = 180 * UI_CONFIG.scale;
    const spacing = CARD_WIDTH + 40 * UI_CONFIG.scale;

    options.forEach((option, index) => {
      const x = startX + index * spacing;

      const card = this.add.image(x, cardY, ASSET_KEYS.CARDS, option.frame)
        .setOrigin(0.5)
        .setInteractive();

      if (option.frame === this.#selectedFrame) {
        card.setTint(0xffff00);
      }

      const nameText = this.add.text(x, cardY + CARD_HEIGHT / 2 + 20 * UI_CONFIG.scale, option.name, {
        fontSize: `${16 * UI_CONFIG.scale}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setInteractive();

      card.on('pointerover', () => {
        if (option.frame !== this.#selectedFrame) {
          card.setTint(0xcccccc);
        }
      });

      card.on('pointerout', () => {
        if (option.frame !== this.#selectedFrame) {
          card.clearTint();
        }
      });

      card.on('pointerdown', () => this.#selectCardBack(option.frame));
      nameText.on('pointerdown', () => this.#selectCardBack(option.frame));

      nameText.on('pointerover', () => {
        nameText.setColor('#ffff00');
        if (option.frame !== this.#selectedFrame) {
          card.setTint(0xcccccc);
        }
      });

      nameText.on('pointerout', () => {
        nameText.setColor('#ffffff');
        if (option.frame !== this.#selectedFrame) {
          card.clearTint();
        }
      });
    });
  }


  #selectCardBack(frame: number): void {
    this.#selectedFrame = frame;
    this.#saveCardBackPreference(frame);
    this.#showConfirmation();
  }


  #showConfirmation(): void {
    if (this.#confirmationOverlay) {
      this.#confirmationOverlay.destroy();
    }

    const overlay = this.add.container(0, 0);
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);

    const messageText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 40 * UI_CONFIG.scale,
      'Card back saved!\nWill apply to next new game.',
      {
        fontSize: `${20 * UI_CONFIG.scale}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      }
    ).setOrigin(0.5);

    overlay.add([bg, messageText]);
    this.#confirmationOverlay = overlay;

    this.time.delayedCall(1500, () => {
      this.#backToMenu();
    });
  }


  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'back to Menu (m)',
      {
        fontSize: `${20 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setColor('#ffff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => this.#backToMenu());

    this.input.keyboard!.on('keydown-M', () => this.#backToMenu());
  }


  #backToMenu(): void {
    if (this.#confirmationOverlay) {
      this.#confirmationOverlay.destroy();
    }
    this.scene.stop(SCENE_KEYS.CARD_BACK_SELECTOR);
    this.scene.start(SCENE_KEYS.MENU);
  }
}

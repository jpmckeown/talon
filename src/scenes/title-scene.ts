import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, AUDIO_KEYS, UI_CONFIG, CARD_WIDTH, CARD_HEIGHT, STACK_Y_GAP } from './common';

export class TitleScene extends Phaser.Scene {
  // #cardFan: Phaser.GameObjects.Image[] = [];
  #tutorialCards!: Phaser.GameObjects.Image[][];
  #movingCard!: Phaser.GameObjects.Image;
  #easyCounter: number = 3;
  #easyText!: Phaser.GameObjects.Text;
  #startButton?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    // this.add.image(this.scale.width / 2, 100, ASSET_KEYS.TITLE, 0).setOrigin(0.5);

    this.#makeTitle();
    this.#makeTutorialTableau();
    this.#makeEasyCounterText();
    this.time.delayedCall(500, () => this.#startTutorialAnimation());
    // this.#makeCardFan();

    this.#makeStartButton();
    this.#makeHelpHint();

    this.input.keyboard!.on('keydown-S', () => {
      this.scene.start(SCENE_KEYS.SCORES);
    });

    this.input.keyboard!.on('keydown-H', () => {
      this.scene.start(SCENE_KEYS.HELP, { from: SCENE_KEYS.TITLE });
    });

    this.input.keyboard!.on('keydown-M', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  public shutdown(): void {
    // delete animation timer when leaving title scene
    this.time.removeAllEvents();
  }


  #makeStartButton(): void {
    const centreX = this.scale.width / 2;
    const centreY = 390 * UI_CONFIG.scale;

    const feltBg = this.add.image(centreX, centreY, ASSET_KEYS.TABLE_BACKGROUND)
      .setDisplaySize(CARD_WIDTH * 3.5, CARD_HEIGHT * 0.6)
      .setOrigin(0.5)
      .setInteractive();;

    const buttonText = this.add.text(centreX, centreY, 'Start', {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive();

    const startGame = () => {
      this.cameras.main.fadeOut(50, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENE_KEYS.GAME);
      });
    };

    feltBg.on('pointerdown', startGame);
    buttonText.on('pointerdown', startGame);

    this.tweens.add({
      targets: [feltBg, buttonText],
      alpha: {
        start: 1,
        from: 1,
        to: 0,
      },
      duration: 1000,
      repeat: -1,
      yoyo: true,
    });
    this.#startButton = feltBg;
  }


  #makeHelpHint(): void {
    const helpText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'Help / how to play (H)',
      {
        fontSize: `${14 * UI_CONFIG.scale}px`,
        color: '#888888'
      }
    ).setOrigin(0.5).setInteractive();

    helpText.on('pointerover', () => helpText.setColor('#00ff00'));
    helpText.on('pointerout', () => helpText.setColor('#888888'));
    helpText.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.HELP, { from: SCENE_KEYS.TITLE });
    });
  }


  #makeTitle(): void {
    const titleY: number = 120;
    const talonText = this.add.text(
      this.scale.width / 2,
      titleY,
      'Talon Solitaire',
      {
        fontSize: '140px',
        color: '#ffd700',  // gold colour
        stroke: '#000000',
        strokeThickness: 5,
        fontFamily: 'Arial Black, Arial',
        shadow: {
          offsetX: 5,
          offsetY: 5,
          color: '#000000',
          blur: 10,
          fill: true
        }
      }
    ).setOrigin(0.5);

    if (talonText.preFX) {
      talonText.preFX.addGlow(0xffd700, 2, 0, false, 0.1, 32);
    }

    this.tweens.add({
      targets: talonText,
      y: titleY - 40,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }


  #makeTutorialTableau(): void {
    const startX = 90 * UI_CONFIG.scale;
    const startY = 170 * UI_CONFIG.scale;
    const stackSpacing = 70 * UI_CONFIG.scale;
    const stackGap = STACK_Y_GAP;

    const stackLayouts = [
      [25],
      [34],
      [0, 1],
      [13, 14, 15],
      [39],
      [40, 41],
      [26]
    ];
    this.#tutorialCards = [];

    stackLayouts.forEach((frames, stackIndex) => {
      const stackCards: Phaser.GameObjects.Image[] = [];
      const x = startX + stackIndex * stackSpacing;

      frames.forEach((frame, cardIndex) => {
        const y = startY + cardIndex * stackGap;
        const card = this.add.image(x, y, ASSET_KEYS.CARDS, frame).setScale(1);
        stackCards.push(card);
      });

      if (stackIndex === 3) {
        const y = startY + frames.length * stackGap;
        this.#movingCard = this.add.image(x, y, ASSET_KEYS.CARDS, 33).setScale(1);
        this.#movingCard.setData({ originalX: x, originalY: y });
        stackCards.push(this.#movingCard);
      }
      this.#tutorialCards.push(stackCards);
    });
  }


  #makeEasyCounterText(): void {
    this.#easyText = this.add.text(50 * UI_CONFIG.scale, 300 * UI_CONFIG.scale, `Easy moves (same-colour) allowance: ${this.#easyCounter}`, {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0);
  }


  #startTutorialAnimation(): void {
    const targetStack = this.#tutorialCards[1];
    const targetCard = targetStack[0];

    if (this.#easyCounter > 0) {
      this.tweens.add({
        targets: this.#movingCard,
        x: targetCard.x,
        y: targetCard.y + STACK_Y_GAP,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          this.sound.play(AUDIO_KEYS.INVALID, { volume: 0.5 });
          this.#easyCounter--;
          this.#easyText.setText(`Easy moves (same-colour) allowance: ${this.#easyCounter}`);

          this.time.delayedCall(2000, () => {
            this.#resetTutorialAnimation();
          });
        }
      });
    } else {
      const originalX = this.#movingCard.getData('originalX');
      const originalY = this.#movingCard.getData('originalY');

      this.tweens.add({
        targets: this.#movingCard,
        x: targetCard.x,
        y: targetCard.y + STACK_Y_GAP,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          // game-scene currently does not play any sound when no Easy moves remain and card gets moved back from inavlid placement (sound naming misleading, should use word Easy, and invalid move perhaps needs a different sound)
          // this.sound.play(AUDIO_KEYS.INVALID, { volume: 0.5 });

          this.tweens.add({
            targets: this.#movingCard,
            x: originalX,
            y: originalY,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
              this.#easyCounter = 3;
              this.#easyText.setText(`Easy moves (same-colour) allowance: ${this.#easyCounter}`);
              this.time.delayedCall(3000, () => {
                this.#resetTutorialAnimation();
              });
            }
          });
        }
      });
    }
  }


  #resetTutorialAnimation(): void {
    const originalX = this.#movingCard.getData('originalX');
    const originalY = this.#movingCard.getData('originalY');

    this.tweens.add({
      targets: this.#movingCard,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.#movingCard.setPosition(originalX, originalY);
        this.tweens.add({
          targets: this.#movingCard,
          alpha: 1,
          duration: 300,
          onComplete: () => {
            // this.#isAnimating = false;
            this.time.delayedCall(500, () => this.#startTutorialAnimation());
          }
        });
      }
    });
  }
}

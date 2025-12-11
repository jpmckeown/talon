import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, AUDIO_KEYS, UI_CONFIG, CARD_WIDTH, CARD_HEIGHT, STACK_Y_GAP } from './common';

export class TitleScene extends Phaser.Scene {
  #tutorialCards!: Phaser.GameObjects.Image[][];
  #movingCard!: Phaser.GameObjects.Image;
  #easyCounter: number = 3;
  #easyText!: Phaser.GameObjects.Text;
  #startButton?: Phaser.GameObjects.Image;
  #isTouchDevice!: boolean;
  #animationStep: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  public create(): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    this.#makeTitle();
    this.#makeTutorialTableau();
    this.#makeEasyCounterText();
    this.time.delayedCall(500, () => this.#startTutorialAnimation());
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
    let helpTextSuffix = "Help / how to play (h)";
    if (this.#isTouchDevice) helpTextSuffix = "Help / how to play";
    const helpText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      helpTextSuffix,
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
      [15, 25, 11],    // 0: 3♦, K♦, Q♣
      [8],             // 1: 9♣
      [39, 23, 28],    // 2: A♠, J♦, 3♥
      [27, 21, 42, 7],  // 3: 2♥, 9♦, 4♠, 8♣
      [44],            // 4: 6♠
      [35, 4, 45],    // 5: 10♥, 5♦, 7♠
      [16, 37, 9]     // 6: 4♦, Q♥, 10♣
    ];
    this.#tutorialCards = [];

    stackLayouts.forEach((frames, stackIndex) => {
      const stackCards: Phaser.GameObjects.Image[] = [];
      const x = startX + stackIndex * stackSpacing;

      frames.forEach((frame, cardIndex) => {
        const y = startY + cardIndex * stackGap;
        const card = this.add.image(x, y, ASSET_KEYS.CARDS, frame).setScale(1);
        card.setData({ originalX: x, originalY: y, originalFrame: frame });
        stackCards.push(card);
      });
      this.#tutorialCards.push(stackCards);
    });
  }


  #makeEasyCounterText(): void {
    this.#easyText = this.add.text(50 * UI_CONFIG.scale, 320 * UI_CONFIG.scale, `Easy moves (same-colour) allowance: ${this.#easyCounter}`, {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0);
  }



  #startTutorialAnimation(): void {
    this.#animationStep = 0;
    this.#doNextAnimationStep();
  }


  #doNextAnimationStep(): void {
    const stack1 = this.#tutorialCards[1];
    switch (this.#animationStep) {
      case 0:
        this.#moveCardToStack(3, 3, 1, true);
        break;
      case 1:
        this.#moveCardToStack(5, 2, 1, true);
        break;
      case 2:
        this.#moveCardToStack(4, 0, 1, true);
        break;
      case 3:
        this.#tryFailedMove(5, 1, 1);
        break;
      case 4:
        this.#moveCardToStack(6, 2, 4, false);
        break;
      case 5:
        this.time.delayedCall(3000, () => {
          this.#resetAllCards();
        });
        break;
    }
  }


  #moveCardToStack(fromStack: number, fromIndex: number, toStack: number, isEasyMove: boolean): void {
    const card = this.#tutorialCards[fromStack][fromIndex];
    card.setDepth(10);
    const targetStack = this.#tutorialCards[toStack];
    const targetY = targetStack.length > 0
      ? targetStack[targetStack.length - 1].y + STACK_Y_GAP
      : 170 * UI_CONFIG.scale;

    this.tweens.add({
      targets: card,
      x: targetStack.length > 0 ? targetStack[0].x : 90 * UI_CONFIG.scale + toStack * 70 * UI_CONFIG.scale,
      y: targetY,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        card.setDepth(0);
        this.sound.play(isEasyMove ? AUDIO_KEYS.EASY_MOVE : AUDIO_KEYS.PLACE_CARD, { volume: 0.5 });

        if (isEasyMove) {
          this.#easyCounter--;
          this.#easyText.setText(`Easy moves (same-colour) allowance: ${this.#easyCounter}`);
        }

        this.#tutorialCards[fromStack].splice(fromIndex, 1);
        this.#tutorialCards[toStack].push(card);

        this.time.delayedCall(2000, () => {
          this.#animationStep++;
          this.#doNextAnimationStep();
        });
      }
    });
  }


  #tryFailedMove(fromStack: number, fromIndex: number, toStack: number): void {
    const card = this.#tutorialCards[fromStack][fromIndex];
    card.setDepth(10);
    const targetStack = this.#tutorialCards[toStack];
    const targetX = targetStack[0].x;
    const targetY = targetStack[targetStack.length - 1].y + STACK_Y_GAP;
    const originalX = card.getData('originalX');
    const originalY = card.getData('originalY');

    this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.sound.play(AUDIO_KEYS.INVALID, { volume: 0.5 });
        this.tweens.add({
          targets: card,
          x: originalX,
          y: originalY,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            card.setDepth(0);
            this.time.delayedCall(2000, () => {
              this.#animationStep++;
              this.#doNextAnimationStep();
            });
          }
        });
      }
    });
  }


  #resetAllCards(): void {
    const allCards: Phaser.GameObjects.Image[] = [];
    this.#tutorialCards.forEach(stack => {
      stack.forEach(card => allCards.push(card));
    });

    this.tweens.add({
      targets: allCards,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.#tutorialCards = [];
        allCards.forEach(card => card.destroy());

        this.#makeTutorialTableau();
        this.#easyCounter = 3;
        this.#easyText.setText(`Easy moves (same-colour) allowance: ${this.#easyCounter}`);

        const newCards: Phaser.GameObjects.Image[] = [];
        this.#tutorialCards.forEach(stack => {
          stack.forEach(card => {
            card.setAlpha(0);
            newCards.push(card);
          });
        });

        this.tweens.add({
          targets: newCards,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
            this.time.delayedCall(1000, () => {
              this.#startTutorialAnimation();
            });
          }
        });
      }
    });
  }
}

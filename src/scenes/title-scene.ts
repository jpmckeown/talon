import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, AUDIO_KEYS, UI_CONFIG, CARD_WIDTH, CARD_HEIGHT, STACK_Y_GAP } from './common';

export class TitleScene extends Phaser.Scene {
  #tutorialCards!: Phaser.GameObjects.Image[][];
  #movingCard!: Phaser.GameObjects.Image;
  #tableauStartY!: number;
  #easyCounter: number = 3;
  #easyText!: Phaser.GameObjects.Text;
  #easyMedallions!: Phaser.GameObjects.Image[];
  #startButton?: Phaser.GameObjects.Image;
  #isTouchDevice!: boolean;
  #animationStep: number = 0;
  #animationRunCount: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  public create(): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    this.#makeTitle();
    this.#makeTutorialTableau();
    this.#makeEasyCounterText();
    this.time.delayedCall(1000, () => this.#startTutorialAnimation());
    this.#makeStartButton();
    this.#makeHelpHint();

    this.input.keyboard!.on('keydown-S', () => {
      this.scene.start(SCENE_KEYS.SCORES);
    });

    this.input.keyboard!.on('keydown-H', () => {
      this.scene.start(SCENE_KEYS.HELP, { from: SCENE_KEYS.TITLE });
    });

    this.input.keyboard!.on('keydown-M', () => {
      this.scene.stop(SCENE_KEYS.TITLE);
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  public shutdown(): void {
    // delete animation timer when leaving title-scene
    this.time.removeAllEvents();
  }


  #makeStartButton(): void {
    const centreX = this.scale.width / 2;
    const centreY = 370 * UI_CONFIG.scale;
    const feltBg = this.add.image(centreX, centreY, ASSET_KEYS.TABLE_BACKGROUND)
      .setDisplaySize(CARD_WIDTH * 3, CARD_HEIGHT * 0.6)
      .setOrigin(0.5)
      .setInteractive();;
    feltBg.on('pointerover', () => feltBg.setTint(0xffff00));
    feltBg.on('pointerout', () => feltBg.clearTint());

    const buttonText = this.add.text(centreX, centreY, 'Start', {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive();

    const startGame = () => {
      this.cameras.main.fadeOut(50, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop(SCENE_KEYS.TITLE);
        this.scene.start(SCENE_KEYS.GAME);
      });
    };
    feltBg.on('pointerdown', startGame);
    buttonText.on('pointerdown', startGame);
    this.#startButton = feltBg;
  }


  #makeHelpHint(): void {
    let helpTextSuffix = "Help / how to play (h)";
    if (this.#isTouchDevice) helpTextSuffix = "Help / how to play";
    const helpText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 65 * UI_CONFIG.scale,
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
        fontSize: '130px',
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

    if (talonText.preFX && !this.#isTouchDevice) {
      talonText.preFX.addGlow(0xffd700, 2, 0, false, 0.1, 32);
    }

    // this.tweens.add({
    //   targets: talonText,
    //   y: titleY - 40,
    //   duration: 3000,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'Sine.easeInOut'
    // });
  }


  #makeTutorialTableau(): void {
    const startX = 90 * UI_CONFIG.scale;
    const startY = 150 * UI_CONFIG.scale;
    this.#tableauStartY = startY;
    const stackSpacing = 70 * UI_CONFIG.scale;
    const stackGap = STACK_Y_GAP;

    const stackLayouts = [
      [15, 25],    // 0: 3♦, K♦
      [8, 11],    // 1: 9♣, Q♣
      [39, 23, 28],    // 2: A♠, J♦, 3♥
      [27, 21, 7],  // 3: 2♥, 9♦, 8♣
      [44],            // 4: 6♠
      [35, 4, 45],    // 5: 10♥, 5♦, 7♠
      [16, 37, 42]     // 6: 4♦, Q♥, 4♠
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
    const x = 50 * UI_CONFIG.scale;
    const y = 300 * UI_CONFIG.scale;
    this.#easyText = this.add.text(x, y, `Easymoves (same-colour) limit: ${this.#easyCounter}`, {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0).setVisible(false);

    this.#easyMedallions = [];
    const medallionStartX = x + this.#easyText.width + 22 * UI_CONFIG.scale;
    const medallionSpacing = 34 * UI_CONFIG.scale;
    const medallionY = y + 10 * UI_CONFIG.scale;

    for (let i = 0; i < this.#easyCounter; i++) {
      const medallion = this.add.image(
        medallionStartX + i * medallionSpacing,
        medallionY,
        ASSET_KEYS.PLAY_MEDALLION
      ).setScale(UI_CONFIG.scale * 0.9).setVisible(false);
      this.#easyMedallions.push(medallion);
    }
  }


  #startTutorialAnimation(): void {
    this.#animationStep = 0;
    this.#doNextAnimationStep();
  }

  #doNextAnimationStep(): void {
    const stack1 = this.#tutorialCards[1];
    switch (this.#animationStep) {
      case 0:
        this.#moveCardWithArc(1, 1, 0, false, 100);
        break;
      case 1:
        this.#moveCardWithArc(2, 2, 6, false, 100);
        break;
      case 2:
        this.#showEasyCounterText();
        break;
      case 3:
        this.#moveCardToStack(3, 2, 1, true);
        break;
      case 4:
        this.#moveCardToStack(5, 2, 1, true);
        break;
      case 5:
        this.#moveCardToStack(4, 0, 1, true);
        break;
      case 6:
        this.#tryFailedMove(5, 1, 1);
        break;
      case 7:
        this.#moveCardToStack(6, 3, 4, false);
        break;
      case 8:
        this.time.delayedCall(3000, () => {
          this.#resetAllCards();
        });
        break;
    }
  }


  #showEasyCounterText(): void {
    this.#easyText.setVisible(true);
    this.#easyMedallions.forEach(m => m.setVisible(true));
    this.tweens.add({
      targets: [this.#easyText, ...this.#easyMedallions],
      alpha: { from: 0, to: 1 },
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.#animationStep++;
          this.#doNextAnimationStep();
        });
      }
    });
  }

  #animateEasyMedallion(): void {
    const usedCount = 3 - this.#easyCounter;
    if (usedCount > 0 && usedCount <= this.#easyMedallions.length) {
      const medallionIndex = 3 - usedCount;
      const medallion = this.#easyMedallions[medallionIndex];

      this.tweens.add({
        targets: medallion,
        scaleX: 0,
        duration: 500,
        yoyo: true,
        repeat: 0,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          const brightness = 1 + Math.abs(medallion.scaleX - 0.5);
          medallion.setTint(Phaser.Display.Color.GetColor(255 * brightness, 255 * brightness, 255 * brightness));
        },
        onComplete: () => {
          medallion.clearTint();
          medallion.setTint(0xff6600);
          this.tweens.add({
            targets: medallion,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.easeOut'
          });
        }
      });
    }
  }


  #flashEasyText(): void {
    this.#easyCounter--;
    this.#easyText.setText(`Easymoves (same-colour) limit: ${this.#easyCounter}`);
    let flashCount = 0;
    const flashInterval = this.time.addEvent({
      delay: 150,
      callback: () => {
        this.#easyText.setColor(flashCount % 2 === 0 ? '#ffffff' : '#ffaa00');
        flashCount++;
        if (flashCount >= 4) {
          flashInterval.remove();
        }
      },
      repeat: 3
    });
  }


  #getTargetPosition(toStack: number): { x: number, y: number } {
    const targetStack = this.#tutorialCards[toStack];
    const x = targetStack.length > 0 ? targetStack[0].x : 90 * UI_CONFIG.scale + toStack * 70 * UI_CONFIG.scale;
    const y = targetStack.length > 0
      ? targetStack[targetStack.length - 1].y + STACK_Y_GAP
      : this.#tableauStartY;
    return { x, y };
  }

  #completeCardMove(card: Phaser.GameObjects.Image, fromStack: number, fromIndex: number, toStack: number, isEasyMove: boolean): void {
    card.setDepth(0);
    this.sound.play(isEasyMove ? AUDIO_KEYS.EASY_MOVE : AUDIO_KEYS.PLACE_CARD, { volume: 0.3 });
    if (isEasyMove) {
      this.#flashEasyText();
      this.#animateEasyMedallion();
    }
    this.#tutorialCards[fromStack].splice(fromIndex, 1);
    this.#tutorialCards[toStack].push(card);

    this.time.delayedCall(2000, () => {
      this.#animationStep++;
      this.#doNextAnimationStep();
    });
  }


  #moveCardToStack(fromStack: number, fromIndex: number, toStack: number, isEasyMove: boolean): void {
    const card = this.#tutorialCards[fromStack][fromIndex];
    card.setDepth(10);
    const targetPos = this.#getTargetPosition(toStack);

    this.tweens.add({
      targets: card,
      x: targetPos.x,
      y: targetPos.y,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.#completeCardMove(card, fromStack, fromIndex, toStack, isEasyMove);
      }
    });
  }


  #moveCardWithArc(fromStack: number, fromIndex: number, toStack: number, isEasyMove: boolean, arcHeight: number): void {
    const card = this.#tutorialCards[fromStack][fromIndex];
    card.setDepth(10);
    const targetPos = this.#getTargetPosition(toStack);

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(card.x, card.y),
      new Phaser.Math.Vector2((card.x + targetPos.x) / 2, Math.max(card.y, targetPos.y) + arcHeight),
      new Phaser.Math.Vector2(targetPos.x, targetPos.y)
    );

    this.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 800,
      ease: 'Power2',
      onUpdate: (tween) => {
        const point = curve.getPoint(tween.getValue() ?? 0);
        card.setPosition(point.x, point.y);
      },
      onComplete: () => {
        this.#completeCardMove(card, fromStack, fromIndex, toStack, isEasyMove);
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
      targets: [...allCards, this.#easyText, ...this.#easyMedallions],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.#tutorialCards = [];
          allCards.forEach(card => card.destroy());

          this.#makeTutorialTableau();
          this.#easyCounter = 3;
          this.#easyText.setText(`Easymoves (same-colour) limit: ${this.#easyCounter}`);
          this.#easyMedallions.forEach(medallion => {
            medallion.clearTint();
            medallion.setAlpha(1);
            medallion.setVisible(false);
          });

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
            duration: 500,
            onComplete: () => {
              this.time.delayedCall(500, () => {
                this.#animationRunCount++;
                if (this.#animationRunCount === 2 && this.#startButton) {
                  this.tweens.add({
                    targets: this.#startButton,
                    alpha: {
                      start: 1,
                      from: 1,
                      to: 0,
                    },
                    duration: 1000,
                    repeat: -1,
                    yoyo: true,
                  });
                }
                this.#startTutorialAnimation();
              });
            }
          });
        });
      }
    });
  }
}

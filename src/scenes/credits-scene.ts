import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT  } from './common';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.CREDITS });
  }
  // #creditsContainer!: Phaser.GameObjects.Container;
  #autoScrollTimer: number = 0;
  #isAutoScrolling: boolean = false;
  #autoScrollTween?: Phaser.Tweens.Tween;
  #maxScrollY: number = 0;

  public create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a4d2a).setOrigin(0);

    this.add.text(220 * UI_CONFIG.scale, 25 * UI_CONFIG.scale, 'Credits', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
    }).setOrigin(0).setScrollFactor(0);

    this.#addBackButton();
    // this.#creditsContainer = this.add.container(0, 75 * UI_CONFIG.scale);

    const credits = [
      {
        name: 'Patrick McKeown',
        contributions: 'project lead; deck spritesheet; owl art; red-kite art; feather card-back; UI navigation; dynamic resize dropzones; scaling experiment; card shadow and border tests; sound system; allow same-colour moves & sound on use; scoring snd high-scores; reveal hidden cards while keydown, Peek button; test 4 Kings tableau offer quick-win; reveal flip on central axis.'
      },
      {
        name: 'McFunkypants (Christer Kaitila)',
        contributions: 'animated particle fx for good card placement; victory animation card-splosion!! on win; eagle art; crow art; cloth background art; soundfx for shuffle, card-pickup, card-place, game win.'
      },
      {
        name: 'Dan Dela Rosa',
        contributions: 'invalidly moved card(s) animate back to where they started, and bugfix; Menu button on game, with navigation; Escape key; nvmrc file.'
      },
      {
        name: 'Chris Deleon',
        contributions: 'itch.io dimensions workaround.'
      },
      {
        name: 'QA playtesters',
        contributions: 'Michael Avrie, Tim Sargent, Noah Wizard, Simone | ZilpioGaming, Calum McKeown, Kirsten McKeown.'
      },
      {
        name: 'Scott Westover',
        contributions: 'built on logic and core mechanics from tutorial.'
      },
    ];

    let yPos = 75 * UI_CONFIG.scale;
    const lineSpacing = 15 * UI_CONFIG.scale;

    credits.forEach(credit => {
      const textHeight = this.#addCreditEntry(credit.name, credit.contributions, yPos);
      yPos += textHeight + lineSpacing;
    });

    const contentHeight = yPos;
    const viewHeight = this.scale.height - 75 * UI_CONFIG.scale - 80 * UI_CONFIG.scale;
    this.#maxScrollY = Math.max(0, contentHeight - viewHeight);

    // this.cameras.main.setBounds(0, 0, GAME_WIDTH, 75 * UI_CONFIG.scale + contentHeight + 30);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, contentHeight + 80 * UI_CONFIG.scale);
    this.cameras.main.setScroll(0, 0);

    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.#onScroll(deltaY);
    });

    const scrollZone = this.add.zone(0, 75 * UI_CONFIG.scale, GAME_WIDTH, viewHeight)
      .setOrigin(0)
      .setInteractive()
      .setScrollFactor(0);
    this.input.setDraggable(scrollZone);

    // this.#creditsContainer.setInteractive(
    //   new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, contentHeight),
    //   Phaser.Geom.Rectangle.Contains
    // );
    // this.input.setDraggable(this.#creditsContainer);

    let dragStartY = 0;
    let cameraStartY = 0;

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: any) => {
      //if (gameObject === this.#creditsContainer) {
      if (gameObject === scrollZone) {
        dragStartY = pointer.y;
        cameraStartY = this.cameras.main.scrollY;
        this.#stopAutoScroll();
      }
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: any) => {
      // if (gameObject === this.#creditsContainer) {
      if (gameObject === scrollZone) {
        const dragDistance = dragStartY - pointer.y;
        const newScrollY = Phaser.Math.Clamp(
          cameraStartY + dragDistance,
          -30,
          this.#maxScrollY + 30
        );
        this.cameras.main.setScroll(0, newScrollY);
      }
    });

    this.input.on('dragend', () => {
      const currentScroll = this.cameras.main.scrollY;
      if (currentScroll < 0) {
        this.tweens.add({
          targets: this.cameras.main,
          scrollY: 0,
          duration: 200,
          ease: 'Quad.easeOut'
        });
      } else if (currentScroll > this.#maxScrollY) {
        this.tweens.add({
          targets: this.cameras.main,
          scrollY: this.#maxScrollY,
          duration: 200,
          ease: 'Quad.easeOut'
        });
      }
      this.#resetAutoScrollTimer();
    });

    this.#resetAutoScrollTimer();
  }


  #addCreditEntry(name: string, contributions: string, yPos: number): number {
    const leftMargin = 45 * UI_CONFIG.scale;
    const rightMargin = 30 * UI_CONFIG.scale;
    const availableWidth = this.scale.width - leftMargin - rightMargin;
    const fullText = name + ': ' + contributions;

    // const fullTextObj = this.add.text(leftMargin, yPos, fullText, {
    //   fontSize: `${14 * UI_CONFIG.scale}px`,
    //   color: '#ffffff',
    //   wordWrap: { width: availableWidth },
    //   align: 'left'
    // }).setOrigin(0);
    // this.#creditsContainer.add(fullTextObj);
    // return fullTextObj.height;
    
    const nameText = this.add.text(leftMargin, yPos, name + ': ', {
      fontSize: `${14 * UI_CONFIG.scale}px`,
      color: '#ffff00'
    }).setOrigin(0);
    const contribText = this.add.text(leftMargin, yPos + nameText.height, contributions, {
      fontSize: `${14 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      wordWrap: { width: availableWidth },
      align: 'left'
    }).setOrigin(0);
    return nameText.height + contribText.height;
  }


  update(time: number, delta: number): void {
    if (!this.#isAutoScrolling) {
      this.#autoScrollTimer += delta;
      if (this.#autoScrollTimer >= 5000) {
        this.#startAutoScroll();
      }
    }
  }


  #onScroll(deltaY: number): void {
    this.#stopAutoScroll();
    const scrollAmount = deltaY * 0.5;
    const newScrollY = Phaser.Math.Clamp(
      this.cameras.main.scrollY + scrollAmount,
      -30,
      this.#maxScrollY + 30
    );
    this.cameras.main.setScroll(0, newScrollY);
    const currentScroll = this.cameras.main.scrollY;
    if (currentScroll < 0) {
      this.tweens.add({
        targets: this.cameras.main,
        scrollY: 0,
        duration: 200,
        ease: 'Quad.easeOut'
      });
    } else if (currentScroll > this.#maxScrollY) {
      this.tweens.add({
        targets: this.cameras.main,
        scrollY: this.#maxScrollY,
        duration: 200,
        ease: 'Quad.easeOut'
      });
    }
    this.#resetAutoScrollTimer();
  }


  #startAutoScroll(): void {
    this.#isAutoScrolling = true;
    const remainingScroll = this.#maxScrollY - this.cameras.main.scrollY;
    const duration = remainingScroll * 50;

    this.#autoScrollTween = this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.#maxScrollY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.#isAutoScrolling = false;
      }
    });
  }


  #stopAutoScroll(): void {
    if (this.#autoScrollTween) {
      this.#autoScrollTween.stop();
      this.#autoScrollTween = undefined;
    }
    this.#isAutoScrolling = false;
  }


  #resetAutoScrollTimer(): void {
    this.#autoScrollTimer = 0;
    this.#stopAutoScroll();
  }

  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'back to Menu (m)',
      {
        fontSize: `${18 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive().setScrollFactor(0);

    backText.on('pointerover', () => backText.setColor('#00ff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => this.backToMenu());

    this.input.keyboard!.on('keydown-M', () => this.backToMenu());
  }

  backToMenu(): void {
    this.scene.stop(SCENE_KEYS.CREDITS);
    this.scene.start(SCENE_KEYS.MENU);
  }
}

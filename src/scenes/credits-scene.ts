import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT  } from './common';

export class CreditsScene extends Phaser.Scene {
  #isTouchDevice!: boolean;
  constructor() {
    super({ key: SCENE_KEYS.CREDITS });
  }
  // #creditsContainer!: Phaser.GameObjects.Container;
  #autoScrollTimer: number = 0;
  #isAutoScrolling: boolean = false;
  #autoScrollTween?: Phaser.Tweens.Tween;
  #maxScrollY: number = 0;
  #delayBeforeAutoScroll: number = 5000;

  public create(): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
    const TITLE_AREA_HEIGHT = 96 * UI_CONFIG.scale;
    const BOTTOM_MARGIN = 80 * UI_CONFIG.scale;

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT * 3, ASSET_KEYS.TABLE_BACKGROUND)
      .setOrigin(0);

    this.add.tileSprite(0, 0, GAME_WIDTH, TITLE_AREA_HEIGHT, ASSET_KEYS.TABLE_BACKGROUND)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(98);

    this.add.text(200 * UI_CONFIG.scale, 20 * UI_CONFIG.scale, 'Credits', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
    }).setOrigin(0).setScrollFactor(0).setDepth(99);

    const leftMargin = 45 * UI_CONFIG.scale;
    const rightMargin = 30 * UI_CONFIG.scale;
    const availableWidth = this.scale.width - leftMargin - rightMargin;
    
    const baseText = this.add.text(leftMargin, 65 * UI_CONFIG.scale, 'Built on a Phaser tutorial code-base by Scott Westover.', {
      fontSize: `${14 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      wordWrap: { width: availableWidth },
      align: 'left'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(99);

    this.#addBackButton();
    // this.#creditsContainer = this.add.container(0, 75 * UI_CONFIG.scale);

    const credits = [
      {
        name: 'Patrick McKeown',
        contributions: 'project lead; spritesheet; owl art; red-kite art; feather card-back; animated tutorial on Title; UI navigation; dynamic dropzones; scaling sharper font; card border; deal & rewind animations; easy-move count; volume settings; quack sound; igh-score storage; Peek reveal hidden cards; test if 4 Kings tableau & offer quick-win; tableau card reveal flip; random X shift cards; long tableau handling & dodge for menu-button; stop card-click triggering abandoned sound; Credits; Help; utilities for test; bugfixing.'
      },
      {
        name: 'Christer Kaitila (McFunkypants)',
        contributions: 'animated particle fx for good card placement on tableau and foundation; victory animation card-splosion!! on win; eagle art; crow art; card-back art (birds & waves), cloth background art; sound fx files for shuffle, card-pickup, card-placement, foundation-add, complete-foundation, game-win, button-press, eagle cry (invalid-move), owl hoot (rewind), and integrating sounds in game.'
      },
      {
        name: 'Dan Dela Rosa',
        contributions: 'when card(s) move invalid they animate back to where they started, and bugfix; Menu button on game, with navigation; Escape key to title; nvmrc file.'
      },
      {
        name: 'Noah Wizard',
        contributions: 'music wav; two versions of medallion to count easymoves; advertising text for itch.io page.'
      },
      {
        name: 'Elizabeth McMahill (McMahem)',
        contributions: 'talons card-back design, and integration on spritesheet.'
      },
      {
        name: 'Philippe Vaillancourt (snowfrogdev)',
        contributions: 'video and audio feedback from multiple game playthroughs.'
      },
      {
        name: 'Jason Timms (fizzybuzzybeezy)',
        contributions: 'soundfx for Peek, and integration in-game.'
      },
      {
        name: 'Mike DiGiovanni',
        contributions: 'edit and typo fixes in Readme.'
      },
      {
        name: 'QA playtesters',
        contributions: 'Philippe Vaillancourt (snowfrogdev), Michael Avrie, Tim Sargent, Noah Wizard, Simone | ZilpioGaming, Jason Timms, Mike DiGiovanni, Dominic Beacham.'
      },
      {
        name: 'Chris DeLeon',
        contributions: 'GIF showreel; itch.io dimensions workaround.'
      },
    ];

    let yPos = TITLE_AREA_HEIGHT + 20 * UI_CONFIG.scale;
    const lineSpacing = 15 * UI_CONFIG.scale;

    credits.forEach(credit => {
      const textHeight = this.#addCreditEntry(credit.name, credit.contributions, yPos);
      yPos += textHeight + lineSpacing;
    });

    const contentHeight = yPos;
    const viewHeight = this.scale.height - TITLE_AREA_HEIGHT - 80 * UI_CONFIG.scale;
    this.#maxScrollY = Math.max(0, contentHeight - viewHeight);

    // use 80 if Menu button is at bottom of screen
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, contentHeight + 20 * UI_CONFIG.scale);
    this.cameras.main.setScroll(0, 0);

    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.#onScroll(deltaY);
    });

    const scrollZone = this.add.zone(0, TITLE_AREA_HEIGHT, GAME_WIDTH, viewHeight)
      .setOrigin(0)
      .setInteractive()
      .setScrollFactor(0);
    this.input.setDraggable(scrollZone);

    let dragStartY = 0;
    let cameraStartY = 0;

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: any) => {
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
          0,
          this.#maxScrollY
        );
        this.cameras.main.setScroll(0, newScrollY);
      }
    });

    this.input.on('dragend', () => {
      this.#resetAutoScrollTimer();
    });
  }


  #addCreditEntry(name: string, contributions: string, yPos: number): number {
    const leftMargin = 45 * UI_CONFIG.scale;
    const rightMargin = 30 * UI_CONFIG.scale;
    const availableWidth = this.scale.width - leftMargin - rightMargin;

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
      if (this.#autoScrollTimer >= this.#delayBeforeAutoScroll) {
        this.#startAutoScroll();
      }
    }
  }


  #onScroll(deltaY: number): void {
    this.#stopAutoScroll();
    const scrollAmount = deltaY * 0.5;
    const newScrollY = Phaser.Math.Clamp(
      this.cameras.main.scrollY + scrollAmount,
      0,
      this.#maxScrollY
    );
    this.cameras.main.setScroll(0, newScrollY);
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
      this.scale.width - 100 * UI_CONFIG.scale,
      37 * UI_CONFIG.scale,
      this.#isTouchDevice ? 'back to Menu' : 'back to Menu (m)',
      {
        fontSize: `${18 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(99);

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

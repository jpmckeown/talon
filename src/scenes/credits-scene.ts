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

    const credits = [
      {
        name: 'Patrick McKeown',
        contributions: 'Project lead; cards deck spritesheet; owl card art; red-kite card art; feather card-back art; UI for scenes; dynamic resize dropzones; scaling experiments; round-corners; card shadow and border tests; sound system; allowance of same-colour moves, and soundfx when used; scoring snd high-score scene; reveal hidden cards while keydown, and Peek button; test 4 Kings tableau and offer quick-win; flip on central axis to reveal card.'
      },
      {
        name: 'McFunkypants (Christer Kaitila)',
        contributions: 'Animated particle fx for good card placement; victory animation card-splosion!! on win; eagle card art; crow card art; table cloth background; soundfx for shuffle, card-pickup, card-place, game win.'
      },
      {
        name: 'Dan Dela Rosa',
        contributions: 'Invalid dropped card(s) move back to where started, and bugfix; Menu button on game, with navigation; Escape key; nvmrc file.'
      },
      {
        name: 'Chris Deleon',
        contributions: 'Itch.io dimensions workaround advice.'
      },
      {
        name: 'QA playtesters',
        contributions: 'Michael Avrie, Tim Sargent, Noah Wizard, Simone | ZilpioGaming, Calum McKeown, Kirsten McKeown.'
      },
      {
        name: 'Scott Westover',
        contributions: 'Talon Solitaire is based on a tutorial with game logic, core UI mechanics, and more.'
      },
    ];

    let yPos = 100 * UI_CONFIG.scale;
    const lineSpacing = 70 * UI_CONFIG.scale;

    credits.forEach(credit => {
      this.#addCreditEntry(credit.name, credit.contributions, yPos);
      yPos += lineSpacing;
    });

  }


  #addCreditEntry(name: string, contributions: string, yPos: number): void {
      
    this.add.text(this.scale.width / 2, yPos, name, {
      fontSize: `${18 * UI_CONFIG.scale}px`,
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, yPos + 20 * UI_CONFIG.scale, contributions, {
      fontSize: `${12 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      wordWrap: { width: 500 * UI_CONFIG.scale },
      align: 'center'
    }).setOrigin(0.5, 0);
  }

  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'back to Menu (m)',
      {
        fontSize: `${24 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

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

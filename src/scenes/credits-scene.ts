import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, GAME_WIDTH, GAME_HEIGHT  } from './common';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.CREDITS });
  }

  public create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a4d2a).setOrigin(0);

    this.add.text(220 * UI_CONFIG.scale, 25 * UI_CONFIG.scale, 'Credits', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
    }).setOrigin(0);

    this.#addBackButton();

    const credits = [
      {
        name: 'Patrick McKeown',
        contributions: 'Project lead; deck spritesheet; owl art; red-kite art; feather card-back; UI navigation; dynamic resize dropzones; scaling experiment; card shadow and border tests; sound system; allow same-colour moves & sound on use; scoring snd high-scores; reveal hidden cards while keydown, Peek button; test 4 Kings tableau offer quick-win; reveal flip on central axis.'
      },
      {
        name: 'McFunkypants (Christer Kaitila)',
        contributions: 'Animated particle fx for good card placement; victory animation card-splosion!! on win; eagle art; crow art; cloth background art; soundfx for shuffle, card-pickup, card-place, game win.'
      },
      {
        name: 'Dan Dela Rosa',
        contributions: 'Invalid dropped card(s) move back to where started, and bugfix; Menu button on game, with navigation; Escape key; nvmrc file.'
      },
      {
        name: 'Chris Deleon',
        contributions: 'Itch.io dimensions workaround.'
      },
      {
        name: 'QA playtesters',
        contributions: 'Michael Avrie, Tim Sargent, Noah Wizard, Simone | ZilpioGaming, Calum McKeown, Kirsten McKeown.'
      },
      {
        name: 'Scott Westover',
        contributions: 'based on tutorial game logic, core UI mechanics, and more.'
      },
    ];

    let yPos = 72 * UI_CONFIG.scale;
    const lineSpacing = 15 * UI_CONFIG.scale;

    credits.forEach(credit => {
      const textHeight = this.#addCreditEntry(credit.name, credit.contributions, yPos);
      yPos += textHeight + lineSpacing;
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


  #addBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40 * UI_CONFIG.scale,
      'back to Menu (m)',
      {
        fontSize: `${18 * UI_CONFIG.scale}px`,
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

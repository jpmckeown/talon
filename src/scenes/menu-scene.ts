import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, AUDIO_KEYS } from './common';

export class MenuScene extends Phaser.Scene {
  #isTouchDevice!: boolean;
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  #menuText(label: string, key: string): string {
    return this.#isTouchDevice ? label : `${label} (${key.toLowerCase()})`;
  }

  public create(): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
    const menuFontSize = 24;
    const menuStartY = 110;
    const menuSpacing = 50;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);

    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    const currentScore = gameScene.score || 0;
    const gameIsActive = this.scene.isActive(SCENE_KEYS.GAME) || this.scene.isPaused(SCENE_KEYS.GAME);
    const hasScores = (JSON.parse(localStorage.getItem('solitaireHighScores') || '[]') as any[]).length > 0;

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Paused', {
      fontSize: `${42 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const menuItems: Array<{ text: string; key: string; action: () => void }> = [];

    // offer Resume game only if a game is Paused
    if (gameIsActive) {
      menuItems.push({ text: this.#menuText('Resume Game', 'r'), key: 'R', action: () => this.resumeGame() });
      // menuItems.push({ text: 'Resume Game (r)', key: 'R', action: () => this.resumeGame() });
    }

    menuItems.push(
      { text: this.#menuText('New Game', 'n'), key: 'N', action: () => this.startNewGame() },
      { text: this.#menuText('How to play', 'h'), key: 'H', action: () => this.showHelp() },
      // { text: this.#menuText('Title tutorial', 'ESC'), key: 'ESC', action: () => this.showTitle() },
      { text: this.#menuText('Settings', 'i'), key: 'I', action: () => this.showSettings() },
      { text: this.#menuText('Card Back', 'b'), key: 'B', action: () => this.showCardBackSelector() },
      { text: this.#menuText('Credits', 'c'), key: 'C', action: () => this.showCredits() },
    );

    if (hasScores) {
      menuItems.push({ text: this.#menuText('High Scores', 's'), key: 'S', action: () => this.showHighScores() });
      // { text: this.#menuText('High Scores', 's'), key: 'S', action: () => this.showHighScores() },
    }

    // draw the Menu
    let yPos = menuStartY * UI_CONFIG.scale;
    menuItems.forEach((item, index) => {
      const menuText = this.add.text(this.scale.width / 2, yPos, item.text, {
        fontSize: `${menuFontSize * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }).setOrigin(0.5).setInteractive();

      menuText.on('pointerover', () => menuText.setColor('#ffff00'));
      menuText.on('pointerout', () => menuText.setColor('#ffffff'));
      menuText.on('pointerdown', () => {
        this.sound.play(AUDIO_KEYS.BUTTON_PRESS, { volume: 1 });
        item.action();
      });
      this.input.keyboard!.on(`keydown-${item.key}`, () => {
        this.sound.play(AUDIO_KEYS.BUTTON_PRESS, { volume: 1 });
        item.action();
      });

      // smaller vertical gap between Settings and Card-back
      const spacing = item.text.startsWith('Resume') || item.text.startsWith('Settings') ? 30 : menuSpacing;
      yPos += spacing * UI_CONFIG.scale;
    });

    this.add.text(this.scale.width / 2, 420 * UI_CONFIG.scale, `Score: ${currentScore}`, {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop(SCENE_KEYS.MENU);
      this.scene.stop(SCENE_KEYS.GAME);
      this.scene.start(SCENE_KEYS.TITLE);
    });

    this.input.keyboard?.on('keydown-DELETE', () => {
      if (confirm('Delete all high scores?')) {
        localStorage.removeItem('solitaireHighScores');
        alert('Scores cleared');
      }
    });
  }


  resumeGame(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.resume(SCENE_KEYS.GAME);
  }

  startNewGame(): void {
    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    // check if game scene initialized
    if (gameScene.scoreText) {
      gameScene.saveCurrentScore();
      gameScene.resetGame();
      this.scene.stop(SCENE_KEYS.MENU);
      this.scene.resume(SCENE_KEYS.GAME);
    } else {
      // game scene never created, so start fresh
      this.scene.stop(SCENE_KEYS.MENU);
      this.scene.start(SCENE_KEYS.GAME);
    }
  }

  showHelp(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.HELP, { from: SCENE_KEYS.MENU });
  }

  showTitle(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.stop(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.TITLE, { from: SCENE_KEYS.MENU });
  }

  showSettings(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.SETTINGS);
  }

  showHighScores(): void {
    // const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    // gameScene.saveCurrentScore();
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.SCORES);
  }

  showCardBackSelector(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.CARD_BACK_SELECTOR);
  }

  showCredits(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.CREDITS);
  }

  quitGame(): void {
    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    gameScene.quitAndSaveScore();
    this.scene.stop(SCENE_KEYS.MENU);
  }
  
}

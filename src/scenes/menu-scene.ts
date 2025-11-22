import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, AUDIO_KEYS } from './common';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  public create(): void {
    const menuFontSize = 24;
    const menuStartY = 110;
    const menuSpacing = 50;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);

    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    const currentScore = gameScene.score || 0;
    const gameIsActive = this.scene.isActive(SCENE_KEYS.GAME) || this.scene.isPaused(SCENE_KEYS.GAME);

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Paused', {
      fontSize: `${42 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const menuItems: Array<{ text: string; key: string; action: () => void }> = [];

    // offer Resume game only if a game is Paused
    if (gameIsActive) {
      menuItems.push({ text: 'Resume Game (r)', key: 'R', action: () => this.resumeGame() });
    }

    menuItems.push(
      { text: 'New Game (n)', key: 'N', action: () => this.startNewGame() },
      { text: 'How to play (h)', key: 'H', action: () => this.showHelp() },
      { text: 'Settings (t)', key: 'T', action: () => this.showSettings() },
      { text: 'Card Back (b)', key: 'B', action: () => this.showCardBackSelector() },
      { text: 'Credits (c)', key: 'C', action: () => this.showCredits() },
      { text: 'High Scores (s)', key: 'S', action: () => this.showHighScores() },
    );

    // draw the Menu
    let yPos = menuStartY * UI_CONFIG.scale;
    menuItems.forEach((item, index) => {
      // let yPos = (menuStartY + index * menuSpacing) * UI_CONFIG.scale;
      // // reduce vertical gap between Settings and Card Back
      // if (item.text.startsWith('Card Back')) {
      //   yPos -= (20 * UI_CONFIG.scale);
      // }

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

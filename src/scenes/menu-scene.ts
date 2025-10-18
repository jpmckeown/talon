import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG } from './common';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  public create(): void {
    const menuFontSize = 24;
    const menuStartY = 140;
    const menuSpacing = 60;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);

    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    const currentScore = gameScene.score || 0;

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Paused', {
      fontSize: `${42 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const menuItems = [
      { text: 'Resume Game (r)', key: 'R', action: () => this.resumeGame() },
      { text: 'New Game (n)', key: 'N', action: () => this.startNewGame() },
      { text: 'High Scores (s)', key: 'S', action: () => this.showHighScores() },
      { text: 'Credits (c)', key: 'C', action: () => this.showCredits() }
    ];

    // draw the Menu
    menuItems.forEach((item, index) => {
      const yPos = (menuStartY + index * menuSpacing) * UI_CONFIG.scale;

      const menuText = this.add.text(this.scale.width / 2, yPos, item.text, {
        fontSize: `${menuFontSize * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }).setOrigin(0.5).setInteractive();

      menuText.on('pointerover', () => menuText.setColor('#ffff00'));
      menuText.on('pointerout', () => menuText.setColor('#ffffff'));
      menuText.on('pointerdown', item.action);
      this.input.keyboard!.on(`keydown-${item.key}`, item.action);
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
    
    gameScene.saveCurrentScore();
    gameScene.resetGame();
    
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.resume(SCENE_KEYS.GAME);
  }

  showHighScores(): void {
    this.scene.stop(SCENE_KEYS.MENU);
    this.scene.pause(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.SCORES);
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

import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG } from './common';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    const currentScore = gameScene.score || 0;

    this.add.text(this.scale.width / 2, 100 * UI_CONFIG.scale, 'Paused', {
      fontSize: `${48 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const resumeText = this.add.text(this.scale.width / 2, 180 * UI_CONFIG.scale, 'Resume Game (R)', {
      fontSize: `${28 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    const newGameText = this.add.text(this.scale.width / 2, 240 * UI_CONFIG.scale, 'New Game (N)', {
      fontSize: `${28 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    const quitText = this.add.text(this.scale.width / 2, 300 * UI_CONFIG.scale, 'Quit (Q)', {
      fontSize: `${28 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    this.add.text(this.scale.width / 2, 400 * UI_CONFIG.scale, `Score: ${currentScore}`, {
      fontSize: `${32 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    [resumeText, newGameText, quitText].forEach(text => {
      text.on('pointerover', () => text.setColor('#ffff00'));
      text.on('pointerout', () => text.setColor('#ffffff'));
    });

    resumeText.on('pointerdown', () => this.resumeGame());
    this.input.keyboard!.on('keydown-R', () => this.resumeGame());

    newGameText.on('pointerdown', () => this.startNewGame());
    this.input.keyboard!.on('keydown-N', () => this.startNewGame());

    quitText.on('pointerdown', () => this.quitGame());
    this.input.keyboard!.on('keydown-Q', () => this.quitGame());
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


  quitGame(): void {
    const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
    gameScene.quitAndSaveScore();
    this.scene.stop(SCENE_KEYS.MENU);
  }
  
}

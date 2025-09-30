import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, UI_CONFIG } from './common';

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.SCORES });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    
    this.add.text(this.scale.width / 2, 50, 'High Scores', {
      fontSize: `${24 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const highScores = JSON.parse(localStorage.getItem('solitaireHighScores') || '[]') as number[];
    
    highScores.forEach((score, index) => {
      this.add.text(this.scale.width / 2, 120 + index * 40, `${index + 1}. ${score}`, {
        fontSize: `${16 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }).setOrigin(0.5);
    });
    
    this.input.keyboard!.on('keydown-M', () => {
      this.scene.start(SCENE_KEYS.TITLE);
    });
  }
}

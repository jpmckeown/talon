import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, UI_CONFIG } from './common';

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.SCORES });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);
    
    this.add.text(this.scale.width / 2, 45 * UI_CONFIG.scale, 'High Scores', {
      fontSize: `${30 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    interface ScoreEntry {
      score: number;
      timestamp: string;
    }

    const allScores = JSON.parse(localStorage.getItem('solitaireHighScores') || '[]') as ScoreEntry[];
    // const highScores = JSON.parse(localStorage.getItem('solitaireHighScores') || '[]') as number[];

    const uniqueScores = new Map<number, ScoreEntry>();
    for (const entry of allScores) {
      if (!uniqueScores.has(entry.score)) {
        uniqueScores.set(entry.score, entry);
      }
    }
    
    const displayScores = Array.from(uniqueScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
   
    // display scores or empty message
    if (displayScores.length === 0) {
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'No scores yet!', {
        fontSize: `${20 * UI_CONFIG.scale}px`,
        color: '#888888'
      }).setOrigin(0.5);
    } else {
      const startY = 100;
      const spacing = 35;
      
      displayScores.forEach((entry, index) => {
        const yPos = (startY + index * spacing) * UI_CONFIG.scale;
        const color = index === 0 ? '#ffd700' : index < 3 ? '#c0c0c0' : '#ffffff';
        
        this.add.text(this.scale.width / 2, yPos, `${index + 1}. ${entry.score} - ${entry.timestamp}`, {
          fontSize: `${20 * UI_CONFIG.scale}px`,
          color: color
        }).setOrigin(0.5);
      });
    }
    
    const backText = this.add.text(
      this.scale.width / 2, 
      this.scale.height - 60 * UI_CONFIG.scale, 
      'back to Menu (m)',
      {
        fontSize: `${20 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();
    
    // hover effect
    backText.on('pointerover', () => backText.setColor('#ffff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => this.backToMenu());
    
    this.input.keyboard!.on('keydown-M', () => this.backToMenu());
  }

  backToMenu(): void {
    this.scene.stop(SCENE_KEYS.SCORES);
    this.scene.start(SCENE_KEYS.MENU);
  }
}

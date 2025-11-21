import * as Phaser from 'phaser';
import { PreloadScene } from './scenes/preload-scene';
import { TitleScene } from './scenes/title-scene';
import { GameScene } from './scenes/game-scene';
import { MenuScene } from './scenes/menu-scene';
import { ScoreScene } from './scenes/scores-scene';
import { CardBackSelectorScene } from './scenes/card-back-selector-scene';
import { CreditsScene } from './scenes/credits-scene';
import { HelpScene } from './scenes/help-scene';
import { SettingsScene } from './scenes/settings-scene';
import { UI_CONFIG } from './scenes/common';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: false,
  roundPixels: true,
  antialias: true,
  scale: {
    parent: 'game-container',
    width: 640 * UI_CONFIG.scale,
    height: 480 * UI_CONFIG.scale,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
    min: {
      width: 480,
      height: 360
    },
    zoom: 1
  },
  backgroundColor: '#387F3C',
  scene: [PreloadScene, TitleScene, GameScene, MenuScene, ScoreScene, CreditsScene, CardBackSelectorScene, HelpScene, SettingsScene],
};

window.onload = () => {
  new Phaser.Game(gameConfig);
};

import * as Phaser from 'phaser';
import { PreloadScene } from './scenes/preload-scene';
import { TitleScene } from './scenes/title-scene';
import { GameScene } from './scenes/game-scene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    parent: 'game-container',
    width: 640,
    height: 480,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // mode: Phaser.Scale.NONE,
    mode: Phaser.Scale.FIT,
    min: {
      width: 480,
      height: 360
    },
    zoom: 1
  },
  backgroundColor: '#387F3C',
  scene: [PreloadScene, TitleScene, GameScene],
};

window.onload = () => {
  new Phaser.Game(gameConfig);
};

import * as Phaser from 'phaser';
import { SCENE_KEYS, UI_CONFIG, AUDIO_KEYS } from './common';

export class SettingsScene extends Phaser.Scene {
  #sfxVolume!: number;
  #musicVolume!: number;
  #sfxText!: Phaser.GameObjects.Text;
  #musicText!: Phaser.GameObjects.Text;
  #isTouchDevice!: boolean;

  constructor() {
    super({ key: SCENE_KEYS.SETTINGS });
  }


  public create(): void {
    this.#isTouchDevice = this.registry.get('isTouchDevice') as boolean;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);

    this.add.text(this.scale.width / 2, 50 * UI_CONFIG.scale, 'Settings', {
      fontSize: `${36 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.#loadVolumes();
    this.#makeVolumeControls();
    this.#makeBackButton();
  }


  #loadVolumes(): void {
    this.#sfxVolume = parseInt(localStorage.getItem('talonSoundVolume') || '70', 10);
    this.#musicVolume = parseInt(localStorage.getItem('talonMusicVolume') || '30', 10);
  }


  #saveVolumes(): void {
    localStorage.setItem('talonSoundVolume', this.#sfxVolume.toString());
    localStorage.setItem('talonMusicVolume', this.#musicVolume.toString());
    // console.log(`Volume sound: ${this.#sfxVolume}, music: ${this.#musicVolume}`);
  }


  #makeVolumeControls(): void {
    const startY = 150;
    const spacing = 60;
    const buttonWidth = 50 * UI_CONFIG.scale;
    const buttonHeight = 40 * UI_CONFIG.scale;

    this.#makeVolumeRow('Soundfx:', this.#sfxVolume, startY, 
      () => this.#adjustSfxVolume(-10),
      () => this.#adjustSfxVolume(10)
    );

    this.#makeVolumeRow('Music:', this.#musicVolume, startY + spacing,
      () => this.#adjustMusicVolume(-10),
      () => this.#adjustMusicVolume(10)
    );
  }


  #makeVolumeRow(label: string, volume: number, y: number, decreaseAction: () => void, increaseAction: () => void): void {
    const centerX = this.scale.width / 2;
    const buttonWidth = 50 * UI_CONFIG.scale;
    const buttonHeight = 40 * UI_CONFIG.scale;

    this.add.text(centerX - 220 * UI_CONFIG.scale, y * UI_CONFIG.scale, label, {
      fontSize: `${24 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const minusButton = this.#makeButton(
      centerX - 60 * UI_CONFIG.scale,
      y * UI_CONFIG.scale,
      buttonWidth,
      buttonHeight,
      '-',
      decreaseAction
    );

    const volumeText = this.add.text(centerX, y * UI_CONFIG.scale, `${volume}%`, {
      fontSize: `${24 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    if (label.includes('Sound')) {
      this.#sfxText = volumeText;
    } else {
      this.#musicText = volumeText;
    }

    const plusButton = this.#makeButton(
      centerX + 60 * UI_CONFIG.scale,
      y * UI_CONFIG.scale,
      buttonWidth,
      buttonHeight,
      '+',
      increaseAction
    );
  }


  #makeButton(x: number, y: number, width: number, height: number, text: string, action: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x03befc, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: `${28 * UI_CONFIG.scale}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, buttonText]);

    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', action);

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x05d4ff, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x03befc, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    return container;
  }


  #adjustSfxVolume(change: number): void {
    this.#sfxVolume = Math.max(0, Math.min(100, this.#sfxVolume + change));
    this.#sfxText.setText(`${this.#sfxVolume}%`);
    this.#saveVolumes();
    this.registry.set('sfxVolume', this.#sfxVolume);

    // immediate test play
    this.sound.volume = this.#sfxVolume / 100;
    this.sound.play(AUDIO_KEYS.PLACE_CARD, { volume: 1 });
  }


  #adjustMusicVolume(change: number): void {
    this.#musicVolume = Math.max(0, Math.min(100, this.#musicVolume + change));
    this.#musicText.setText(`${this.#musicVolume}%`);
    this.#saveVolumes();
    this.registry.set('musicVolume', this.#musicVolume);

    // immediate feedback
    const music = this.registry.get('music') as Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    if (music) {
      music.volume = Math.pow(this.#musicVolume / 100, 1.5) * 0.5;
      //music.volume = (this.#musicVolume / 100) * 0.2;
    }
  }


  #makeBackButton(): void {
    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 60 * UI_CONFIG.scale,
      this.#isTouchDevice ? 'back to Menu' : 'back to Menu (m)',
      {
        fontSize: `${24 * UI_CONFIG.scale}px`,
        color: '#ffffff'
      }
    ).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setColor('#ffff00'));
    backText.on('pointerout', () => backText.setColor('#ffffff'));
    backText.on('pointerdown', () => {
      this.sound.play(AUDIO_KEYS.BUTTON_PRESS, { volume: 1 });
      this.backToMenu();
    });

    this.input.keyboard!.on('keydown-M', () => {
      this.sound.play(AUDIO_KEYS.BUTTON_PRESS, { volume: 1 });
      this.backToMenu();
    });
  }


  backToMenu(): void {
    this.scene.stop(SCENE_KEYS.SETTINGS);
    this.scene.start(SCENE_KEYS.MENU);
  }
}

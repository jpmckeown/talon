import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS, AUDIO_KEYS, UI_CONFIG, CARD_WIDTH, CARD_HEIGHT } from './common';

export class TitleScene extends Phaser.Scene {
  #cardFan: Phaser.GameObjects.Image[] = [];
  #startButton?: Phaser.GameObjects.Image;
  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  public create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    this.add.image(this.scale.width / 2, 100, ASSET_KEYS.TITLE, 0).setOrigin(0.5);

    this.#makeCardFan();
    this.#makeStartButton();
    this.#makeHelpHint();

    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.cameras.main.fadeOut(50, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENE_KEYS.GAME);
      });
    });

    this.input.keyboard!.on('keydown-S', () => {
      this.scene.start(SCENE_KEYS.SCORES);
    });

    this.input.keyboard!.on('keydown-H', () => {
      this.scene.start(SCENE_KEYS.HELP, { from: SCENE_KEYS.TITLE });
    });

    this.input.keyboard!.on('keydown-M', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }


  #makeCardFan(): void {
    const centreX = this.scale.width / 2;
    const centreY = 240 * UI_CONFIG.scale;
    const cardCount = 7;
    const spacing = CARD_WIDTH * 1.2;
    const maxRotation = 0;

    for (let i = 0; i < cardCount; i++) {
      const offset = (i - (cardCount - 1) / 2);
      const x = centreX + offset * spacing;
      const y = centreY + Math.abs(offset) * 8 * UI_CONFIG.scale;
      const rotation = (offset / (cardCount - 1)) * maxRotation * (Math.PI / 180);
      
      const randomFrame = Phaser.Math.Between(0, 51);
      const card = this.add.image(x, y, ASSET_KEYS.CARDS, randomFrame)
        .setRotation(rotation)
        .setOrigin(0.5);
      this.#cardFan.push(card);
    }
    this.#startSequentialShuffle();
  }


  #startSequentialShuffle(): void {
    let currentCardIndex = 0;
    const flipDelay = 2000;

    const shuffleNextCard = () => {
      const card = this.#cardFan[currentCardIndex];
      const newFrame = Phaser.Math.Between(0, 51);
      
      this.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 150,
        onComplete: () => {
          card.setFrame(newFrame);
          this.sound.play(AUDIO_KEYS.SHUFFLE_DECK, { volume: 0.3 });
          
          this.tweens.add({
            targets: card,
            scaleX: 1,
            duration: 150
          });
        }
      });

      currentCardIndex = (currentCardIndex + 1) % this.#cardFan.length;
    };

    this.time.addEvent({
      delay: flipDelay,
      callback: shuffleNextCard,
      loop: true
    });
  }


  #makeStartButton(): void {
    const centreX = this.scale.width / 2;
    const centreY = 380 * UI_CONFIG.scale;

    const feltBg = this.add.image(centreX, centreY, ASSET_KEYS.TABLE_BACKGROUND)
      .setDisplaySize(CARD_WIDTH * 3.5, CARD_HEIGHT * 0.6)
      .setOrigin(0.5);

    const buttonText = this.add.text(centreX, centreY, 'Click to Start', {
      fontSize: `${20 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [feltBg, buttonText],
      alpha: {
        start: 1,
        from: 1,
        to: 0,
      },
      duration: 1000,
      repeat: -1,
      yoyo: true,
    });
    this.#startButton = feltBg;
  }


  #makeHelpHint(): void {
    this.add.text(
      this.scale.width / 2,
      this.scale.height - 30 * UI_CONFIG.scale,
      'Press H for Help',
      {
        fontSize: `${14 * UI_CONFIG.scale}px`,
        color: '#888888'
      }
    ).setOrigin(0.5);
  }
}

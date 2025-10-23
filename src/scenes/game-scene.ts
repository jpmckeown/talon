import * as Phaser from 'phaser';
import { ASSET_KEYS, AUDIO_KEYS, CARD_HEIGHT, CARD_WIDTH, DEFAULT_CARD_BACK_FRAME, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_CONFIG } from './common';
import { CONFIG } from '../lib/common';
import { Solitaire } from '../lib/solitaire';
import { Card } from '../lib/card';
import { exhaustiveGuard, countEmptyTableau } from '../lib/utils';
import { FoundationPile } from '../lib/foundation-pile';
import { Effects } from '../lib/effects';
import { TestUtils } from '../lib/test-utils';

// scale factor for card image game objects // not used
const OBJECT_SCALE = 1;

// vertical gap between stacked cards i.e. in tableau
const STACK_Y_GAP = 28 * UI_CONFIG.scale;

// corner of card radius pixels
const CARD_RADIUS = 7 * UI_CONFIG.scale;

// horizontal random shift to make tableau less precise
const maxShiftX = 0;

// // frame of card spritesheet for back of a card
// const CARD_BACK_FRAME = 56;

// shadow settings for cards
const SHADOW_REST_X = 0;
const SHADOW_REST_Y = 0;
const SHADOW_REST_INTENSITY = 0;
const SHADOW_DRAG_X = -4;
const SHADOW_DRAG_Y = 0;
const SHADOW_DRAG_INTENSITY = 0.9;

// x & y positions of the 4 foundation piles
export const FOUNDATION_PILE_X_POSITIONS = [360* UI_CONFIG.scale, 425* UI_CONFIG.scale, 490* UI_CONFIG.scale, 555* UI_CONFIG.scale];
export const FOUNDATION_PILE_Y_POSITION = 5 * UI_CONFIG.scale;
// x & y position of the Talon or discard pile
const DISCARD_PILE_X_POSITION = 85 * UI_CONFIG.scale;
const DISCARD_PILE_Y_POSITION = 5 * UI_CONFIG.scale;

const DRAW_PILE_X_POSITION = 5 * UI_CONFIG.scale;
const DRAW_PILE_Y_POSITION = 5 * UI_CONFIG.scale;
const DRAW_PILE_X_OFFSET = 0 * UI_CONFIG.scale;

// x & y position of first tableau pile
const TABLEAU_PILE_X_POSITION = 40 * UI_CONFIG.scale;
const TABLEAU_PILE_Y_POSITION = 92 * UI_CONFIG.scale;

// starting frame of each Suit in the spritesheet of cards deck
const SUIT_FRAMES = {
  HEART: 26,
  DIAMOND: 13,
  SPADE: 39,
  CLUB: 0,
};

type ZoneType = keyof typeof ZONE_TYPE;
// types of drop zones where player can drop cards
const ZONE_TYPE = {
  FOUNDATION: 'FOUNDATION',
  TABLEAU: 'TABLEAU',
} as const;


export class GameScene extends Phaser.Scene {
  // core Patience game logic and game state
  #solitaire!: Solitaire;
  // keeps track of card game objects in draw pile (3 i.e. not whole pile)
  #drawPileCards!: Phaser.GameObjects.Image[];
  // card GO in discard pile (2 i.e. only top and the card below)
  #discardPileCards!: Phaser.GameObjects.Image[];
  // card GO in each foundation pile (4, i.e. only the top card)
  #foundationPileCards!: Phaser.GameObjects.Image[];
  // tracks containers, one for each tableau pile (7 game objects)
  #tableauContainers!: Phaser.GameObjects.Container[];

  // spawns particle effects during the game
  #fx!: Effects;

  #cardBackFrame: number = DEFAULT_CARD_BACK_FRAME;

  #isPeeking: boolean = false;
  #testUtils!: TestUtils;

  #lastTime: number = 0;
  #logTimer: number = 0;

  #fastCompleteOfferDismissed: boolean = false;
  #fastCompleteOverlay?: Phaser.GameObjects.Container;

  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  public create(): void {
    // this.cameras.main.fadeIn(1000);
    this.#loadCardBackPreference();

    this.#createTableBackground();
    this.#fx = new Effects(this); // particles

    this.#solitaire = new Solitaire(this.#fx);
    this.#solitaire.newGame();
    this.#testUtils = new TestUtils(this.#solitaire);
    (window as any).testUtils = this.#testUtils;

    this.#createDrawPile();
    this.#createDiscardPile();
    this.#createFoundationPiles();
    this.#createTableauPiles();

    // setup drop zones for interactions and events for drag
    this.#createDragEvents();
    this.#createDropZones();

    this.input.keyboard?.on('keydown-W', () => {
      console.log('W key pressed: advancing Foundation piles for instant win');
      this.#clearTableauForInstantWin();
      this.#testUtils.advanceFoundations();
      this.score = 52;
      const scoring = "Score " + this.score;
      this.scoreText.setText(scoring)
      this.#updateFoundationPiles();
    });

    this.#lastTime = 0;
    this.#logTimer = 0;

    this.makeScore();
    this.makeMenuButton();
    this.makePeekButton();

    this.input.keyboard!.on('keydown-M', () => {
      this.scene.pause();
      this.scene.launch(SCENE_KEYS.MENU);
    });

    this.input.keyboard!.on('keydown-Q', () => {
      this.quitAndSaveScore();
    });

    this.input.keyboard?.on('keydown-U', () => {
      if (!this.#isPeeking) {
        this.#startPeekMode();
      }
    });

    this.input.keyboard?.on('keyup-U', () => {
      if (this.#isPeeking) {
        this.#endPeekMode();
      }
    });

    this.input.keyboard?.on('keydown-E', () => {
      const input = window.prompt('Empty which tableau pile? (0-6)');
      if (input !== null) {
        const pileIndex = parseInt(input, 10);
        if (!isNaN(pileIndex)) {
          this.#testUtils.emptyTableau(pileIndex);
          this.#testUtils.clearTableauContainer(pileIndex, this.#tableauContainers);
        }
      }
    });

    this.input.keyboard?.on('keydown-A', () => {
      this.#testUtils.setupFastCompleteTest(
        this.#tableauContainers,
        this.#drawPileCards,
        this.#discardPileCards,
        this.#getCardFrameFromSuit.bind(this),
        this.#getCardFrame.bind(this)
      );
      if (this.#checkFastCompleteCondition()) {
        this.#showFastCompleteOverlay();
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start(SCENE_KEYS.TITLE);
    });

    // game is starting so play an intro sound
    // if this seems to play too late, it is because
    // phaser defers sounds until after the first user input
    // due to browser restrictions against autoplay
    this.sound.play(AUDIO_KEYS.SHUFFLE_DECK, { volume: 1 });
  }

  update(time: number, delta: number) {
      // const frameTime = time - this.#lastTime;
      // this.#lastTime = time;
      
      // // log every 500ms
      // this.#logTimer += frameTime;
      // if (this.#logTimer > 50000) {
      //     console.log('FPS:', this.game.loop.actualFps.toFixed(1));
      //     this.#logTimer = 0;
      // }
  }

  #loadCardBackPreference(): void {
    const saved = localStorage.getItem('solitaireCardBack');
    this.#cardBackFrame = saved ? parseInt(saved, 10) : DEFAULT_CARD_BACK_FRAME;
  }


  makeScore(){
    // position between talon/discard pile and leftmost foundation pile
    const x = (DISCARD_PILE_X_POSITION + CARD_WIDTH + FOUNDATION_PILE_X_POSITIONS[0]) / 2;
    const y = FOUNDATION_PILE_Y_POSITION + CARD_HEIGHT * 0.40;
    
    this.scoreText = this.add.text(x, y, 'Score 0', {
      fontSize: `${24 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  makeMenuButton() {
    const x = (DISCARD_PILE_X_POSITION + FOUNDATION_PILE_X_POSITIONS[0]) / 2;
    const y = FOUNDATION_PILE_Y_POSITION + CARD_HEIGHT * 0.60;

    const buttonWidth = CARD_WIDTH;
    const buttonHeight = CARD_HEIGHT * 0.30;

    const buttonBase = this.add.graphics({ x, y });
    buttonBase.fillStyle(0x03befc, 1);
    buttonBase.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 24);

    this.add.text(x + buttonWidth / 2, y + buttonHeight / 2, 'Menu', {
      fontSize: `${12 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const hitArea = new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight);
    buttonBase.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains).on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch(SCENE_KEYS.MENU);
    });

  }


  makePeekButton() {
    const x = (DISCARD_PILE_X_POSITION + FOUNDATION_PILE_X_POSITIONS[0]) / 2 + CARD_WIDTH * 1.1;
    const y = FOUNDATION_PILE_Y_POSITION + CARD_HEIGHT * 0.60;

    const buttonWidth = CARD_WIDTH;
    const buttonHeight = CARD_HEIGHT * 0.30;

    const buttonBase = this.add.graphics({ x, y });
    buttonBase.fillStyle(0x03befc, 1);
    buttonBase.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 24);

    this.add.text(x + buttonWidth / 2, y + buttonHeight / 2, 'Peek', {
      fontSize: `${12 * UI_CONFIG.scale}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const hitArea = new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight);
    buttonBase.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => {
        buttonBase.clear();
        buttonBase.fillStyle(0x0288c7, 1);  // darker colour when pressed; TODO match peek card tint?
        buttonBase.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 24);
        if (!this.#isPeeking) {
          this.#startPeekMode();
        }
      })
      .on('pointerup', () => {
        buttonBase.clear();
        buttonBase.fillStyle(0x03befc, 1);  // restore original colour
        buttonBase.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 24);
        if (this.#isPeeking) {
          this.#endPeekMode();
        }
      })
      .on('pointerout', () => {
        buttonBase.clear();
        buttonBase.fillStyle(0x03befc, 1);  // if pointer leaves button while held down, treat that as unpressing
        buttonBase.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 24);
        if (this.#isPeeking) {
          this.#endPeekMode();
        }
      });
  }


  quitAndSaveScore(): void {
    this.saveCurrentScore();
    this.score = 0;
    this.game.destroy(true);
  }

  resetScore(): void {
    this.score = 0;
    if (this.scoreText) {
      this.scoreText.setText('Score 0');
    }
  }

  saveCurrentScore(): void {
    if (this.score === 0) return;

    const highScores = JSON.parse(localStorage.getItem('solitaireHighScores') || '[]') as number[];

    highScores.push(this.score);
    highScores.sort((a, b) => b - a);
    highScores.splice(7);

    localStorage.setItem('solitaireHighScores', JSON.stringify(highScores));
    console.log(`Saved score: ${this.score}`);
  }


  resetGame(): void {
    this.#loadCardBackPreference();
    this.saveCurrentScore();
    this.score = 0;
    this.scoreText.setText('Score 0');
    this.#fastCompleteOfferDismissed = false;

    this.#solitaire.newGame();

    // rebuild all card displays
    this.#tableauContainers.forEach(container => container.destroy());
    this.#drawPileCards.forEach(card => card.destroy());
    this.#discardPileCards.forEach(card => card.destroy());
    this.#foundationPileCards.forEach(card => card.destroy());

    this.#createDrawPile();
    this.#createDiscardPile();
    this.#createFoundationPiles();
    this.#createTableauPiles();
  }

  #scale(value: number): number {
    return value * UI_CONFIG.scale;
  }

  #createTableBackground(): void {
    let bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.TABLE_BACKGROUND);
    bg.setOrigin(0, 0);
  }

  #createDrawPile(): void {
    // create outline for pile
    this.#drawCardLocationBox(DRAW_PILE_X_POSITION, DRAW_PILE_Y_POSITION);

    // create initial draw pile game object cards
    this.#drawPileCards = [];
    for (let i = 0; i < 3; i += 1) {
      this.#drawPileCards.push(this.#createCard(DRAW_PILE_X_POSITION + i * DRAW_PILE_X_OFFSET, DRAW_PILE_Y_POSITION, false));
    }

    // create zone to listen for click events, which triggers the drawing card logic
    const drawZone = this.add
      .zone(0, 0, CARD_WIDTH + 20, CARD_HEIGHT + 12)
      .setOrigin(0)
      .setInteractive();

    drawZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // if no cards in either pile, we don't need to do anything in the ui
      if (this.#solitaire.drawPile.length === 0 && this.#solitaire.discardPile.length === 0) {
        return;
      }

      // if no cards in draw pile, need to shuffle in discard pile
      if (this.#solitaire.drawPile.length === 0) {
        this.#solitaire.shuffleDiscardPile();
        // show no cards in discard pile
        this.#discardPileCards.forEach((card) => card.setVisible(false));
        // show cards in draw pile based on number of cards in pile
        this.#showCardsInDrawPile();
        return;
      }

      // reaching here means cards exist in draw pile
      this.#solitaire.drawCard();
      this.sound.play(AUDIO_KEYS.DRAW_CARD, { volume: 1 });
      this.#animateDrawCard();

      // update shown cards in draw pile, based on number of cards in pile
      //this.#showCardsInDrawPile();

      // // update card-below-top in discard pile to reflect the top card
      // const lowerCard = this.#discardPileCards[0]
      // lowerCard.setFrame(this.#discardPileCards[1].frame)
      // lowerCard.setVisible(this.#discardPileCards[1].visible);

      // // update top card in the discard pile to reflect card we drew
      // const card = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 1];
      // this.#discardPileCards[1].setFrame(this.#getCardFrame(card)).setVisible(true);
    });

    if (UI_CONFIG.showDropZones) {
      this.add.rectangle(drawZone.x, drawZone.y, drawZone.width, drawZone.height, 0xff0000, 0.5).setOrigin(0);
    }
  }


  #createDiscardPile(): void {
    // create outline for pile
    this.#drawCardLocationBox(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION);

    // create initial discard pile game object cards. we only need two game objects, which will represent the two most recently drawn cards, and at the start of game these will not be visible until the player draws a new card
    this.#discardPileCards = [];
    const lowerCard = this.#createCard(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false);
    const topCard = this.#createCard(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false);
    this.#discardPileCards.push(lowerCard, topCard);
  }


  #createFoundationPiles(): void {
    this.#foundationPileCards = [];

    // create outline for each foundation pile
    FOUNDATION_PILE_X_POSITIONS.forEach((x) => {
      this.#drawCardLocationBox(x, FOUNDATION_PILE_Y_POSITION);
      // create phaser game object for each pile, these will not be visible at game start
      // but once we add the ace to the pile, we will make this card visible
      const card = this.#createCard(x, FOUNDATION_PILE_Y_POSITION, false).setVisible(false);
      this.#foundationPileCards.push(card);
    });
  }


  #createTableauPiles(): void {
    this.#tableauContainers = [];

    this.#solitaire.tableauPiles.forEach((pile, pileIndex) => {
      const x = TABLEAU_PILE_X_POSITION + pileIndex * 85 * UI_CONFIG.scale;
      const tableauContainer = this.add.container(x, TABLEAU_PILE_Y_POSITION, []);
      this.#tableauContainers.push(tableauContainer);

      pile.forEach((card, cardIndex) => {
        const horizontalShift = Math.floor(Math.random() * (2*maxShiftX+1)) - maxShiftX;
        const cardGameObject = this.#createCard(horizontalShift, cardIndex * STACK_Y_GAP, false, cardIndex, pileIndex);
        tableauContainer.add(cardGameObject);
        if (card.isFaceUp) {
          cardGameObject.setFrame(this.#getCardFrame(card));
          this.input.setDraggable(cardGameObject);
        }
      });
    });
  }


  #drawCardLocationBox(x: number, y: number): void {
    // using grapics instead of rectangle GO because in Phaser 3.90 graphics offers rounded corners. 
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000, 0.5);
    graphics.strokeRoundedRect(x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  }


  #createCard(
    x: number,
    y: number,
    draggable: boolean,
    cardIndex?: number,
    pileIndex?: number,
  ): Phaser.GameObjects.Image {
    const card = this.add
      .image(x, y, ASSET_KEYS.CARDS, this.#cardBackFrame)
      .setOrigin(0)
      .setInteractive({ draggable: draggable })
      .setScale(OBJECT_SCALE)
      .setData({
        x,
        y,
        cardIndex,
        pileIndex,
      });

    if (card.preFX && UI_CONFIG.enableShadows) {
      // shadow for cards in Tableau or talon (not for drawpile)
      // if (draggable || pileIndex !== undefined) {
      // Bugfix: easier to put shadow on all cards as drawpile cards never move anyway
        card.preFX!.addShadow(SHADOW_REST_X, SHADOW_REST_Y, 0.05, 1, 0x000000, 8, SHADOW_REST_INTENSITY);
      // }
    }
    return card;
  }


  #createDragEvents(): void {
    this.#createDragStartEventListener();
    this.#createOnDragEventListener();
    this.#createDragEndEventListener();
    this.#createDropEventListener();
  }


  #createDragStartEventListener(): void {
    // listen for the drag start event on a game object, this will be used to store the original position of the game object, that way we can put the object back in the original position if an invalid move is made
    this.input.on(
      Phaser.Input.Events.DRAG_START,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        // don't allow starting new drag while card is returning from a failed drop
        if (gameObject.getData('returning')) {
          return;
        }

        // store objects position
        gameObject.setData({ x: gameObject.x, y: gameObject.y });

        // update depth on container or image game object, so when we drag the card it is visible above all other game objects
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        if (tableauPileIndex !== undefined) {
          this.#tableauContainers[tableauPileIndex].setDepth(2);
        } else {
          gameObject.setDepth(2);
        }
        // update card alpha to show which card is being dragged
        gameObject.setAlpha(0.8);

        // display shadow while dragging card
        this.#updateDraggedCardShadow(gameObject, SHADOW_DRAG_X, SHADOW_DRAG_Y, SHADOW_DRAG_INTENSITY);
        this.#updateStackedCardsShadow(gameObject, SHADOW_DRAG_X, SHADOW_DRAG_Y, SHADOW_DRAG_INTENSITY);

        this.sound.play(AUDIO_KEYS.DRAW_CARD, { volume: 1 });

      },
    );
  }


  #createOnDragEventListener(): void {
    // listen for the drag event on a game object, this will be used to move game objects along the mouse path as we click and drag an object in our scene
    this.input.on(
      Phaser.Input.Events.DRAG,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.setPosition(dragX, dragY);
        // gameObject.setDepth(0);

        // if card is part of tableau, need to move all cards that are stacked on top of this card
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        const cardIndex = gameObject.getData('cardIndex') as number;
        if (tableauPileIndex !== undefined) {
          const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
          for (let i = 1; i <= numberOfCardsToMove; i += 1) {
            this.#tableauContainers[tableauPileIndex]
              .getAt<Phaser.GameObjects.Image>(cardIndex + i)
              .setPosition(dragX, dragY + STACK_Y_GAP * i);
          }
        }
      },
    );
  }


  #createDragEndEventListener(): void {
    // listen for drag-end event on a game object, this will be used to check where GO was placed in scene, and  if that is a valid move, otherwise reset GO position to original location.
    this.input.on(
      Phaser.Input.Events.DRAG_END,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {

        // // restore shadow to resting state for all cards in stack
        // this.#updateDraggedCardShadow(gameObject, SHADOW_REST_X, SHADOW_REST_Y, SHADOW_REST_INTENSITY);
        // this.#updateStackedCardsShadow(gameObject, SHADOW_REST_X, SHADOW_REST_Y, SHADOW_REST_INTENSITY);

        // reset the depth on the container or image game object
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        if (tableauPileIndex !== undefined) {
          this.#tableauContainers[tableauPileIndex].setDepth(0);
        } else {
          gameObject.setDepth(0);
        }

        // if game object was not destroyed, still active, update GO data to where card was placed
        if (gameObject.active) {
          gameObject.setPosition(gameObject.getData('x') as number, gameObject.getData('y') as number);
 
          // reset card GO alpha since we are done moving it
          gameObject.setAlpha(1);

          // if card is part of a tableau, also move all the cards that are stacked on top of this card back to original location
          const cardIndex = gameObject.getData('cardIndex') as number;
          if (tableauPileIndex !== undefined) {
            const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
            for (let i = 1; i <= numberOfCardsToMove; i += 1) {
              const cardToMove = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(
                cardIndex + i,
              );
              cardToMove.setPosition(cardToMove.getData('x') as number, cardToMove.getData('y') as number);
            }
          }
        }
      },
    );
  }


  /**
   * Determines the number of cards that should also be moved with the current card game object that is being
   * dragged. Example, in a pile I have the cards 5 -> 4 -> 3, and I want to move the whole stack, when I drag the 5
   * card, cards 4 and 3 should also move. If I drag the 4 card, we should not move card 5, but card 3 should be
   * moved with card 4.
   */
  #getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex: number, cardIndex: number): number {
    if (tableauPileIndex !== undefined) {
      const lastCardIndex = this.#tableauContainers[tableauPileIndex].length - 1;
      if (lastCardIndex === cardIndex) {
        return 0;
      }

      return lastCardIndex - cardIndex;
    }
    return 0;
  }

  #createDropZones(): void {
    // Foundation (F) and  Tableau (T) are 2 types of dropzone: for each zone add custom data so when the `drag` event listener is invoked can run specific logic for that zone type.

    // One drop zone for all foundation piles (game automatically places the card in correct pile)
    const F_zone_topleft = this.#scale(350);
    const F_zone_width = this.#scale(270);
    const F_zone_height = this.#scale(85);

    let zone = this.add.zone(F_zone_topleft, 0, F_zone_width, F_zone_height).setOrigin(0).setRectangleDropZone(F_zone_width, F_zone_height).setData({
      zoneType: ZONE_TYPE.FOUNDATION,
    });
    if (UI_CONFIG.showDropZones) {
      this.add.rectangle(F_zone_topleft, 0, zone.width, zone.height, 0xff0000, 0.2).setOrigin(0);
    }

    // drop zone for each tableau pile in the game (the 7 main piles)
    for (let i = 0; i < 7; i += 1) {
      zone = this.add
        .zone(30* UI_CONFIG.scale + i * 85*UI_CONFIG.scale, 92*UI_CONFIG.scale, 75.5*UI_CONFIG.scale, 585*UI_CONFIG.scale)
        .setOrigin(0)
        .setRectangleDropZone(75.5*UI_CONFIG.scale, 585*UI_CONFIG.scale)
        .setData({
          zoneType: ZONE_TYPE.TABLEAU,
          tableauIndex: i,
        })
        .setDepth(-1);
      if (UI_CONFIG.showDropZones) {
        this.add.rectangle(30* UI_CONFIG.scale + i * 85*UI_CONFIG.scale, 92*UI_CONFIG.scale, zone.width, zone.height, 0xff0000, 0.5).setOrigin(0);
      }
    }
  }

  #createDropEventListener(): void {
    // listen for drop events on a game object, this will be used for knowing which card pile a player is trying to add a card game object to which will then trigger validation logic to check if a valid move was maded
    this.input.on(
      Phaser.Input.Events.DROP,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        const zoneType = dropZone.getData('zoneType') as ZoneType;
        if (zoneType === ZONE_TYPE.FOUNDATION) {
          this.#handleMoveCardToFoundation(gameObject);
          return;
        }
        const tableauIndex = dropZone.getData('tableauIndex') as number;
        this.#handleMoveCardToTableau(gameObject, tableauIndex);
      },
    );
  }


  #getFoundationIndexForCard(gameObject: Phaser.GameObjects.Image): number {
    // determine suit from the card's frame
    const frame = parseInt(gameObject.frame.name, 10);
    if (frame >= 0 && frame <= 12) return 1;  // clubs
    if (frame >= 13 && frame <= 25) return 3;  // diamonds
    if (frame >= 26 && frame <= 38) return 2;  // hearts
    if (frame >= 39 && frame <= 51) return 0;  // spades
    return -1;
  }

  #handleMoveCardToFoundation(gameObject: Phaser.GameObjects.Image): void {
    let isValidMove = false;
    let isCardFromDiscardPile = false;

    // check if card is from discard pile or tableau pile based on the pileIndex in the data manager
    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;

    // if from tableau, check if a stack is being dragged
    if (tableauPileIndex !== undefined) {
      const cardIndex = gameObject.getData('cardIndex') as number;
      const pileLength = this.#tableauContainers[tableauPileIndex].length;
      
      // if dragging a stack reject the move
      if (cardIndex < pileLength - 1) {
        return; // dragend handler will return cards to original position
      }
      
      isValidMove = this.#solitaire.moveTableauCardToFoundation(tableauPileIndex);
    } else {
      isValidMove = this.#solitaire.playDiscardPileCardToFoundation();
      isCardFromDiscardPile = true;
    }

    // if this is not a valid move, we don't need to update anything on the card since the `dragend` event handler will move the card back to the original location
    if (!isValidMove) {
      return;
    }

    // particle fx at foundation pile location
    const foundationIndex = this.#getFoundationIndexForCard(gameObject);
    if (foundationIndex !== -1) {
      const px = FOUNDATION_PILE_X_POSITIONS[foundationIndex];
      const py = FOUNDATION_PILE_Y_POSITION;
      this.#fx.poof(px, py);
    }

    this.sound.play(AUDIO_KEYS.FOUNDATION_ADD, { volume: 1 });

    // update discard pile cards, or flip over tableau cards if needed
    if (isCardFromDiscardPile) {
      this.#updateCardGameObjectsInDiscardPile();
    } else {
      this.#handleRevealingNewTableauCards(tableauPileIndex as number);
    }

    // only destroy card from tableau, since talon/discard will be reused
    if (!isCardFromDiscardPile) {
      gameObject.destroy();
      const emptyCount = countEmptyTableau(this.#solitaire.tableauPiles);
      // console.log(`Empty tableau piles: ${emptyCount}`);
    }
    // update Phaser game objects
    this.#updateFoundationPiles();

    this.score += 1;
    this.scoreText.setText(`Score ${this.score}`);

    if (!this.#fastCompleteOfferDismissed && this.#checkFastCompleteCondition()) {
      this.#showFastCompleteOverlay();
    }
  }


  #handleMoveCardToTableau(gameObject: Phaser.GameObjects.Image, targetTableauPileIndex: number): void {
    let isValidMove = false;
    let isCardFromDiscardPile = false;

    // get original size of Tableau pile: enables check on length limit; and where to put card(s)
    const originalTargetPileSize = this.#tableauContainers[targetTableauPileIndex].length;

    // check if card is from Talon or Tableau pile based on the pileIndex in data manager
    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
    const tableauCardIndex = gameObject.getData('cardIndex') as number;

    let quantityCardsMoving = 1;
    if (tableauPileIndex !== undefined) {
      quantityCardsMoving = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, tableauCardIndex) + 1;
    }
    
    // check target tableau stack length limit before attempting move
    if (originalTargetPileSize + quantityCardsMoving > CONFIG.maxTableauStack) {
      console.log(`Sorry, moving ${quantityCardsMoving} card(s) to tableau pile ${targetTableauPileIndex}: would exceed stack length limit of ${CONFIG.maxTableauStack} cards`);
      return;
    }

    if (tableauPileIndex === undefined) {
      isValidMove = this.#solitaire.playDiscardPileCardToTableau(targetTableauPileIndex);
      isCardFromDiscardPile = true;
    } else {
      isValidMove = this.#solitaire.moveTableauCardsToAnotherTableau(
        tableauPileIndex,
        tableauCardIndex,
        targetTableauPileIndex,
      );
    }

    // if this is not a valid move, we don't need to update anything on the card(s) since the `dragend` event handler will move the card(s) back to the original location.
    if (!isValidMove) {
      return;
    }

    this.sound.play(AUDIO_KEYS.PLACE_CARD, { volume: 1 });

    this.#tableauContainers[targetTableauPileIndex].setDepth(0);
    // ensure source container depth is also reset
    if (tableauPileIndex !== undefined) {
      this.#tableauContainers[tableauPileIndex].setDepth(0);
    }

    // add single discard pile card to tableau as a new game object
    if (isCardFromDiscardPile) {
      const horizontalShift = Math.floor(Math.random() * (2*maxShiftX+1)) - maxShiftX;
      const card = this.#createCard(
        horizontalShift,
        originalTargetPileSize * STACK_Y_GAP,
        true,
        originalTargetPileSize,
        targetTableauPileIndex,
      );
      card.setFrame(gameObject.frame);
      this.#tableauContainers[targetTableauPileIndex].add(card);

      const px = horizontalShift + this.#tableauContainers[targetTableauPileIndex].x;
      const py = originalTargetPileSize * STACK_Y_GAP + this.#tableauContainers[targetTableauPileIndex].y;
      this.#fx.poof(px, py);
      
      // update the remaining cards in discard pile
      this.#updateCardGameObjectsInDiscardPile();

      if (!this.#fastCompleteOfferDismissed && this.#checkFastCompleteCondition()) {
        this.#showFastCompleteOverlay();
      }
      return;
    }

    // for each card in the current stack that is being moved, we need to remove the card from the existing container and add to the target tableau container
    const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex as number, tableauCardIndex);
    for (let i = 0; i <= numberOfCardsToMove; i += 1) {
      const cardGameObject =
        this.#tableauContainers[tableauPileIndex as number].getAt<Phaser.GameObjects.Image>(tableauCardIndex);
      this.#tableauContainers[tableauPileIndex as number].removeAt(tableauCardIndex);
      this.#tableauContainers[targetTableauPileIndex].add(cardGameObject);

      // update phaser game object data to match the new values for tableau and card index
      const cardIndex = originalTargetPileSize + i;
      const horizontalShift = Math.floor(Math.random() * (2*maxShiftX+1)) - maxShiftX;
      cardGameObject.setData({
        x: horizontalShift,
        y: cardIndex * STACK_Y_GAP,
        cardIndex,
        pileIndex: targetTableauPileIndex,
      });

      // WORK IN PROGRESS!
      // FIXME: only poof when you do something awesome
      // TODO: add different types of poofs especially on a WIN
      // spawn a particle effect
      // where is the card on screen?
      let px = horizontalShift + cardGameObject.parentContainer.x;// + (CARD_WIDTH/2);
      let py = cardIndex * STACK_Y_GAP + cardGameObject.parentContainer.y;// + (CARD_HEIGHT/2);
      this.#fx.poof(px,py);
    }

    // update depth on container to be the original value
    this.#tableauContainers[tableauPileIndex as number].setDepth(0);

    // get the card's tableau pile and check to see if new card at bottom of stack should be flipped over
    this.#handleRevealingNewTableauCards(tableauPileIndex as number);

    // card is from other tableau because if talon-sourced was handled earlier
    const emptyCount = countEmptyTableau(this.#solitaire.tableauPiles);
    // console.log(`Empty tableau piles: ${emptyCount}`);

    if (!this.#fastCompleteOfferDismissed && this.#checkFastCompleteCondition()) {
      this.#showFastCompleteOverlay();
    }
  }


  #checkFastCompleteCondition(): boolean {
    // console.log('Check if victory inevitable but cards not yet all dragged to Foundation piles (if so offer fast complete)...');
    if (this.#solitaire.drawPile.length > 0 || this.#solitaire.discardPile.length > 0) {
      return false;
    }

    const nEmptyTableau = countEmptyTableau(this.#solitaire.tableauPiles);
    console.log('Empty tableau count = ', nEmptyTableau)
    if (nEmptyTableau !== 3) {
      return false;
    }

    for (const pile of this.#solitaire.tableauPiles) {
      if (pile.length > 0) {
        const headerCard = pile[0];
        console.log('top card value = ', headerCard.value)
        if (headerCard.value !== 13 || !headerCard.isFaceUp) {
          return false;
        }

        for (const card of pile) {
          // console.log('other card value ', card.value)
          if (!card.isFaceUp) {
            return false;
          }
        }
      }
    }
    console.log('Game completion is inevitable now and it only requires moving cards from tableau to Foundation piles');
    return true;
  }


  #showFastCompleteOverlay(): void {
    const overlay = this.add.container(0, 0);
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);

    const messageText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 40 * UI_CONFIG.scale,
      'Victory now inevitable - end game early with full score?',
      {
        fontSize: `${16 * UI_CONFIG.scale}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      }
    ).setOrigin(0.5);

    const yesText = this.add.text(
      GAME_WIDTH / 2 - 80 * UI_CONFIG.scale,
      GAME_HEIGHT / 2 + 40 * UI_CONFIG.scale,
      'Yes',
      {
        fontSize: `${32 * UI_CONFIG.scale}px`,
        color: '#00ff00'
      }
    ).setOrigin(0.5).setInteractive();

    const noText = this.add.text(
      GAME_WIDTH / 2 + 80 * UI_CONFIG.scale,
      GAME_HEIGHT / 2 + 40 * UI_CONFIG.scale,
      'No',
      {
        fontSize: `${32 * UI_CONFIG.scale}px`,
        color: '#ff0000'
      }
    ).setOrigin(0.5).setInteractive();

    yesText.on('pointerover', () => yesText.setColor('#ffffff'));
    yesText.on('pointerout', () => yesText.setColor('#00ff00'));
    yesText.on('pointerdown', () => {
      this.score = 52;
      this.saveCurrentScore();
      overlay.destroy();
      
      // duplicate of code when W key pressed 
      this.#clearTableauForInstantWin();
      this.#testUtils.advanceFoundations();
      this.score = 52;
      const scoring = "Score " + this.score;
      this.scoreText.setText(scoring)
      this.#updateFoundationPiles();
    });

    noText.on('pointerover', () => noText.setColor('#ffffff'));
    noText.on('pointerout', () => noText.setColor('#ff0000'));
    noText.on('pointerdown', () => {
      this.#fastCompleteOfferDismissed = true;
      overlay.destroy();
    });

    overlay.add([bg, messageText, yesText, noText]);
    this.#fastCompleteOverlay = overlay;
  }


  // Updates the top and bottom cards in talon/discard pile to reflect the state from Solitaire game instance.
  #updateCardGameObjectsInDiscardPile(): void {
    // update the top card in the discard pile to reflect the card below it
    this.#discardPileCards[1].setFrame(this.#discardPileCards[0].frame).setVisible(this.#discardPileCards[0].visible);
    // update the bottom card in the discard pile to have the correct value based on the solitaire game state
    const discardPileCard = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 2];
    if (discardPileCard === undefined) {
      this.#discardPileCards[0].setVisible(false);
    } else {
      this.#discardPileCards[0].setFrame(this.#getCardFrame(discardPileCard)).setVisible(true);
    }
  }


  // checks tableau pile that played card came from to see if need to flip next card in stack.
  #handleRevealingNewTableauCards(tableauPileIndex: number): void {
    // update tableau container depth
    this.#tableauContainers[tableauPileIndex].setDepth(0);
    // check to see if the tableau pile card at the bottom of the sack needs to be flipped over
    const flipTableauCard = this.#solitaire.flipTopTableauCard(tableauPileIndex);
    if (flipTableauCard) {
      const tableauPile = this.#solitaire.tableauPiles[tableauPileIndex];
      const tableauCard = tableauPile[tableauPile.length - 1];
      const cardGameObject = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(
        tableauPile.length - 1,
      );
      // cardGameObject.setFrame(this.#getCardFrame(tableauCard));
      // this.input.setDraggable(cardGameObject);

      // animation to flip card on vertical axis
      const flipDuration = 200; 
      this.tweens.add({
        targets: cardGameObject,
        scaleX: 0,
        duration: flipDuration,
        ease: 'Linear',
        onComplete: () => {
          cardGameObject.setFrame(this.#getCardFrame(tableauCard));
          this.tweens.add({
            targets: cardGameObject,
            scaleX: 1,
            duration: flipDuration,
            ease: 'Linear',
            onComplete: () => {
              this.input.setDraggable(cardGameObject);
            }
          });
        }
      });
    }
  }


  // After a card is dropped in foundation zone, updates each card in foundation piles to have the latest card frame. Will make the card visible if an Ace is played.
  #updateFoundationPiles(): void {
    this.#solitaire.foundationPiles.forEach((pile: FoundationPile, pileIndex: number) => {
      if (pile.value === 0) {
        return;
      }
      this.#foundationPileCards[pileIndex].setVisible(true).setFrame(this.#getCardFrame(pile));
    });
  }


  #revealTableauCards(): void {
    this.#solitaire.revealAllTableauCards();

    this.#tableauContainers.forEach((container, pileIndex) => {
      const pile = this.#solitaire.tableauPiles[pileIndex];
      pile.forEach((card, cardIndex) => {
        if (card.isFaceUp) {
          const cardGameObject = container.getAt<Phaser.GameObjects.Image>(cardIndex);
          cardGameObject.setFrame(this.#getCardFrame(card));
          this.input.setDraggable(cardGameObject);
        }
      });
    });
  }

  #startPeekMode(): void {
    this.#isPeeking = true;
    this.#tableauContainers.forEach((container, pileIndex) => {
      const pile = this.#solitaire.tableauPiles[pileIndex];
      pile.forEach((card, cardIndex) => {
        if (!card.isFaceUp) {
          const cardGameObject = container.getAt<Phaser.GameObjects.Image>(cardIndex);
          cardGameObject.setFrame(this.#getCardFrame(card));
          cardGameObject.setTint(0x8888ff);
        }
      });
    });
  }

  #endPeekMode(): void {
    this.#isPeeking = false;
    this.#tableauContainers.forEach((container, pileIndex) => {
      const pile = this.#solitaire.tableauPiles[pileIndex];
      pile.forEach((card, cardIndex) => {
        if (!card.isFaceUp) {
          const cardGameObject = container.getAt<Phaser.GameObjects.Image>(cardIndex);
          cardGameObject.setFrame(this.#cardBackFrame);
          // cardGameObject.setFrame(CARD_BACK_FRAME);
          cardGameObject.clearTint();
        }
      });
    });
  }


  #showCardsInDrawPile(): void {
    const numberOfCardsToShow = Math.min(this.#solitaire.drawPile.length, 3);
    this.#drawPileCards.forEach((card, cardIndex) => {
      const showCard = cardIndex < numberOfCardsToShow;
      card.setVisible(showCard);
    });
  }


  #getCardFrame(data: Card | FoundationPile): number {
    return SUIT_FRAMES[data.suit] + data.value - 1;
  }
  #getCardFrameFromSuit(suit: string, value: number): number {
    return SUIT_FRAMES[suit] + value - 1;
  }


  #updateDraggedCardShadow(gameObject: Phaser.GameObjects.Image, shadowX: number, shadowY: number, intensity: number): void {
    if (!UI_CONFIG.enableShadows) return;
    if (gameObject.preFX) {
      const shadowFx = gameObject.preFX.list.find(fx => fx.type === 5) as any;
      if (shadowFx) {
        shadowFx.x = shadowX;
        shadowFx.y = shadowY;
        shadowFx.intensity = intensity;
      }
    }
  }

  #updateStackedCardsShadow(gameObject: Phaser.GameObjects.Image, shadowX: number, shadowY: number, intensity: number): void {
    if (!UI_CONFIG.enableShadows) return;

    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
    const cardIndex = gameObject.getData('cardIndex') as number;
    
    if (tableauPileIndex !== undefined) {
      const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
      for (let i = 1; i <= numberOfCardsToMove; i += 1) {
        const stackedCard = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(cardIndex + i);
        if (stackedCard.preFX) {
          const stackedShadowFx = stackedCard.preFX.list.find(fx => fx.type === 5) as any;
          if (stackedShadowFx) {
            stackedShadowFx.x = shadowX;
            stackedShadowFx.y = shadowY;
            stackedShadowFx.intensity = intensity;
          }
        }
      }
    }
  }


  #clearTableauForInstantWin(): void {
    // destroy all card game objects in all tableau
    this.#tableauContainers.forEach(container => {
      container.removeAll(true); // true = destroy children
    });

    this.#discardPileCards.forEach(card => {
      card.setVisible(false);
    });

    this.#drawPileCards.forEach(card => {
      card.setVisible(false);
    });
    console.log('Talon, draw, and Tableau all cleared for instant win');
  }


  #animateDrawCard(): void {
    this.input.enabled = false;
    const liftedScale = 1.05;

    const card = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 1];
    const tempCard = this.add
      .image(DRAW_PILE_X_POSITION, DRAW_PILE_Y_POSITION, ASSET_KEYS.CARDS, this.#cardBackFrame)
      .setOrigin(0)
      .setScale(liftedScale)
      .setDepth(10);

    this.tweens.add({
      targets: tempCard,
      x: DISCARD_PILE_X_POSITION,
      y: DISCARD_PILE_Y_POSITION,
      scaleX: 0,
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        tempCard.setFrame(this.#getCardFrame(card));
        this.tweens.add({
          targets: tempCard,
          scaleX: liftedScale,
          duration: 500,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            tempCard.destroy();
            this.#showCardsInDrawPile();

            const lowerCard = this.#discardPileCards[0];
            lowerCard.setFrame(this.#discardPileCards[1].frame);
            lowerCard.setVisible(this.#discardPileCards[1].visible);

            this.#discardPileCards[1].setFrame(this.#getCardFrame(card)).setVisible(true);
            this.input.enabled = true;
          }
        });
      }
    });
  }
}

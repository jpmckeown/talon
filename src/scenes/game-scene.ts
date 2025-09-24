import * as Phaser from 'phaser';
import { ASSET_KEYS, AUDIO_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS, UI_CONFIG } from './common';
import { Solitaire } from '../lib/solitaire';
import { Card } from '../lib/card';
import { FoundationPile } from '../lib/foundation-pile';
import { Effects } from '../lib/effects';

// scale factor for card image game objects
const SCALE = 1;

// vertical gap between stacked cards i.e. in tableau
const STACK_Y_GAP = 23;

// horizontal random shift to make tableau less precise
const maxShiftX = 0;

// frame of card spritesheet for back of a card
const CARD_BACK_FRAME = 56;

// shadow settings for cards
const SHADOW_REST_X = 0;
const SHADOW_REST_Y = +4;
const SHADOW_REST_INTENSITY = 0.2;
const SHADOW_DRAG_X = -4;
const SHADOW_DRAG_Y = -5;
const SHADOW_DRAG_INTENSITY = 0.5;

// x & y positions of the 4 foundation piles
const FOUNDATION_PILE_X_POSITIONS = [360, 425, 490, 555];
const FOUNDATION_PILE_Y_POSITION = 5;
// x & y position of the Talon or discard pile
const DISCARD_PILE_X_POSITION = 85;
const DISCARD_PILE_Y_POSITION = 5;

const DRAW_PILE_X_POSITION = 5;
const DRAW_PILE_Y_POSITION = 5;
const DRAW_PILE_X_OFFSET = 0;

// x & y position of first tableau pile
const TABLEAU_PILE_X_POSITION = 40;
const TABLEAU_PILE_Y_POSITION = 92;

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
  #fx: Effects;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  public create(): void {
    // this.cameras.main.fadeIn(1000);

    this.#createTableBackground();
    this.#fx = new Effects(this); // particles

    this.#solitaire = new Solitaire(this.#fx);
    this.#solitaire.newGame();

    this.#createDrawPile();
    this.#createDiscardPile();
    this.#createFoundationPiles();
    this.#createTableauPiles();

    // setup drop zones for interactions and events for drag
    this.#createDragEvents();
    this.#createDropZones();
  }

  #createTableBackground(): void {
    let bg = this.add.tileSprite(0, 0, 1200, 1200, ASSET_KEYS.TABLE_BACKGROUND);
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
      .zone(0, 0, CARD_WIDTH * SCALE + 20, CARD_HEIGHT * SCALE + 12)
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
      this.sound.play(AUDIO_KEYS.DRAW_CARD, { volume: 0.03 });

      // update shown cards in draw pile, based on number of cards in pile
      this.#showCardsInDrawPile();

      // update card-below-top in discard pile to reflect the top card
      const lowerCard = this.#discardPileCards[0]
      lowerCard.setFrame(this.#discardPileCards[1].frame)
      lowerCard.setVisible(this.#discardPileCards[1].visible);

      // update top card in the discard pile to reflect card we drew
      const card = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 1];
      this.#discardPileCards[1].setFrame(this.#getCardFrame(card)).setVisible(true);
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
      const x = TABLEAU_PILE_X_POSITION + pileIndex * 85;
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
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000, 0.3);
    graphics.strokeRoundedRect(x, y, CARD_WIDTH, CARD_HEIGHT, 7);
    // const box = this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT).setOrigin(0)
    // box.setStrokeStyle(1, 0x000000, 0.5);
  }


  #createCard(
    x: number,
    y: number,
    draggable: boolean,
    cardIndex?: number,
    pileIndex?: number,
  ): Phaser.GameObjects.Image {
    const card = this.add
      .image(x, y, ASSET_KEYS.CARDS, CARD_BACK_FRAME)
      .setOrigin(0)
      .setInteractive({ draggable: draggable })
      .setData({
        x,
        y,
        cardIndex,
        pileIndex,
      });
    
    //   // add top border for stacked card separation
    // const border = this.#drawCardTopBorder(x, y);
    // card.setData({ ...card.data.values, borderGraphics: border });

    if (card.preFX) {
      // // shadow for cards in Tableau or talon (not for drawpile)
      // if (draggable || pileIndex !== undefined) {
      // Bugfix: easier to put shadow on all cards as drawpile cards never move anyway
        card.preFX!.addShadow(SHADOW_REST_X, SHADOW_REST_Y, 0.05, 1, 0x000000, 8, SHADOW_REST_INTENSITY);
      // }
    }
    return card;
  }


  #drawCardTopBorder(x: number, y: number): Phaser.GameObjects.Graphics {
    const border = this.add.graphics();
    border.lineStyle(1, 0x000000, 0.3);
    border.beginPath();
    border.arc(x + 7, y + 7, 7, Math.PI, Math.PI * 1.5);
    border.arc(x + CARD_WIDTH - 7, y + 7, 7, Math.PI * 1.5, 0);
    border.lineTo(x + CARD_WIDTH, y);
    border.lineTo(x, y);
    border.closePath();
    border.strokePath();
    return border;
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
        // store objects position
        gameObject.setData({ x: gameObject.x, y: gameObject.y });
        // update depth on container or image game object, so when we drag the card it is visible above all other game objects
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        if (tableauPileIndex !== undefined) {
          this.#tableauContainers[tableauPileIndex].setDepth(2);
        } else {
          gameObject.setDepth(2);
        }
        // // update card objects alpha so we know which card is actively being dragged
        // gameObject.setAlpha(0.8);

        // display shadow while dragging card
        this.#updateDraggedCardShadow(gameObject, SHADOW_DRAG_X, SHADOW_DRAG_Y, SHADOW_DRAG_INTENSITY);
        this.#updateStackedCardsShadow(gameObject, SHADOW_DRAG_X, SHADOW_DRAG_Y, SHADOW_DRAG_INTENSITY);

      },
    );
  }


  #createOnDragEventListener(): void {
    // listen for the drag event on a game object, this will be used to move game objects along the mouse path as we click and drag an object in our scene
    this.input.on(
      Phaser.Input.Events.DRAG,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.setPosition(dragX, dragY);
        gameObject.setDepth(0);

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
    // listen for drag-end event on a game object, this will be used to check were the game object was placed
    // in our scene, and depending on were the object was placed we will check if that is a valid move in our game
    // otherwise, we will reset the objects position back to were the object was originally located at
    this.input.on(
      Phaser.Input.Events.DRAG_END,
      (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {

        // restore shadow to resting state for all cards in stack
        this.#updateDraggedCardShadow(gameObject, SHADOW_REST_X, SHADOW_REST_Y, SHADOW_REST_INTENSITY);
        this.#updateStackedCardsShadow(gameObject, SHADOW_REST_X, SHADOW_REST_Y, SHADOW_REST_INTENSITY);

        // reset the depth on the container or image game object
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        if (tableauPileIndex !== undefined) {
          this.#tableauContainers[tableauPileIndex].setDepth(0);
        } else {
          gameObject.setDepth(0);
        }

        // if game object was not destroyed, still active, we need to update that GO's data to match where card was placed
        if (gameObject.active) {
          gameObject.setPosition(gameObject.getData('x') as number, gameObject.getData('y') as number);
          // reset card game object's alpha since we are done moving the object
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
    // create drop zone for foundation piles, in the game we will have 1 drop zone and then automatically place the card in the pile it belongs
    // for each drop zone, we add custom data so when the `drag` event listener is invoked, we can run specific logic to that zone type
    let zone = this.add.zone(350, 0, 270, 85).setOrigin(0).setRectangleDropZone(270, 85).setData({
      zoneType: ZONE_TYPE.FOUNDATION,
    });
    if (UI_CONFIG.showDropZones) {
      this.add.rectangle(350, 0, zone.width, zone.height, 0xff0000, 0.2).setOrigin(0);
    }

    // drop zone for each tableau pile in the game (the 7 main piles)
    for (let i = 0; i < 7; i += 1) {
      zone = this.add
        .zone(30 + i * 85, 92, 75.5, 585)
        .setOrigin(0)
        .setRectangleDropZone(75.5, 585)
        .setData({
          zoneType: ZONE_TYPE.TABLEAU,
          tableauIndex: i,
        })
        .setDepth(-1);
      if (UI_CONFIG.showDropZones) {
        this.add.rectangle(30 + i * 85, 92, zone.width, zone.height, 0xff0000, 0.5).setOrigin(0);
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
    // // Below fails to stop a stack of Tableau cards trying to drop
    // if (tableauPileIndex === undefined) {
    //   isValidMove = this.#solitaire.playDiscardPileCardToFoundation();
    //   isCardFromDiscardPile = true;
    // } else {
    //   isValidMove = this.#solitaire.moveTableauCardToFoundation(tableauPileIndex);
    // }

    // if this is not a valid move, we don't need to update anything on the card since the `dragend` event handler will move the card back to the original location
    if (!isValidMove) {
      return;
    }

    this.sound.play(AUDIO_KEYS.FOUNDATION_ADD, { volume: 1 });

    // update discard pile cards, or flip over tableau cards if needed
    if (isCardFromDiscardPile) {
      this.#updateCardGameObjectsInDiscardPile();
    } else {
      this.#handleRevealingNewTableauCards(tableauPileIndex as number);
    }

    // only destroy card from tableau, since we need to reuse the card from the discard pile
    if (!isCardFromDiscardPile) {
      gameObject.destroy();
    }
    // update our phaser game objects
    this.#updateFoundationPiles();
  }

  #handleMoveCardToTableau(gameObject: Phaser.GameObjects.Image, targetTableauPileIndex: number): void {
    let isValidMove = false;
    let isCardFromDiscardPile = false;

    // store reference to the original size of the tableau pile so we know were to place game object
    const originalTargetPileSize = this.#tableauContainers[targetTableauPileIndex].length;

    // check if card is from discard pile or tableau pile based on the pileIndex in the data manager
    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
    const tableauCardIndex = gameObject.getData('cardIndex') as number;
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
    this.#tableauContainers[targetTableauPileIndex].setDepth(0);

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
      // update the remaining cards in discard pile
      this.#updateCardGameObjectsInDiscardPile();
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
      let px = horizontalShift + cardGameObject.parentContainer.x + (CARD_WIDTH/2);
      let py = cardIndex * STACK_Y_GAP + cardGameObject.parentContainer.y + (CARD_HEIGHT/2);
      this.#fx.poof(px,py);

    }

    // update depth on container to be the original value
    this.#tableauContainers[tableauPileIndex as number].setDepth(0);

    // get the cards tableau pile and check to see if the new card at the bottom of the stack should be flipped over
    this.#handleRevealingNewTableauCards(tableauPileIndex as number);
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


  /* Checks tableau pile that played card came from to see if we now need to flip next card in the stack.
  */
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
      cardGameObject.setFrame(this.#getCardFrame(tableauCard));
      this.input.setDraggable(cardGameObject);
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


  #updateDraggedCardShadow(gameObject: Phaser.GameObjects.Image, shadowX: number, shadowY: number, intensity: number): void {
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
  // #updateStackedCardsShadow(gameObject: Phaser.GameObjects.Image, shadowX: number, shadowY: number, intensity: number): void {
  //   const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
  //   const cardIndex = gameObject.getData('cardIndex') as number;
    
  //   if (tableauPileIndex !== undefined) {
  //     const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
  //     for (let i = 0; i <= numberOfCardsToMove; i += 1) {
  //       const stackedCard = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(cardIndex + i);
  //       if (stackedCard.preFX) {
  //         const stackedShadowFx = stackedCard.preFX.list.find(fx => fx.type === 5) as any;
  //         if (stackedShadowFx) {
  //           stackedShadowFx.x = shadowX;
  //           stackedShadowFx.y = shadowY;
  //           stackedShadowFx.intensity = intensity;
  //         }
  //       }
  //     }
  //   }
  // }
}

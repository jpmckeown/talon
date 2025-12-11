import { Solitaire } from './solitaire';
import { CARD_SUIT } from './common';
import { Card } from './card';
import { CardValue } from './common';

export class TestUtils {
  #solitaire: Solitaire;

  constructor(solitaire: Solitaire) {
    this.#solitaire = solitaire;
  }

  // instantly advance all 4 foundation piles to specified values
  // default is all Kings (13) for instant win
  public advanceFoundations(
    spades: number = 13,
    clubs: number = 13,
    hearts: number = 13,
    diamonds: number = 13
  ): void {
    console.log(`advancing foundations: spades=${spades}, clubs=${clubs}, hearts=${hearts}, diamonds=${diamonds}`);
    
    const piles = this.#solitaire.foundationPiles;
    const spadePile = piles.find(p => p.suit === CARD_SUIT.SPADE);
    const clubPile = piles.find(p => p.suit === CARD_SUIT.CLUB);
    const heartPile = piles.find(p => p.suit === CARD_SUIT.HEART);
    const diamondPile = piles.find(p => p.suit === CARD_SUIT.DIAMOND);

    // directly set values (bypass normal game rules)
    if (spadePile) this.#forceFoundationValue(spadePile, spades);
    if (clubPile) this.#forceFoundationValue(clubPile, clubs);
    if (heartPile) this.#forceFoundationValue(heartPile, hearts);
    if (diamondPile) this.#forceFoundationValue(diamondPile, diamonds);

    this.#solitaire.checkForWin();
  }


  // helper advances a foundation pile to specific card
  #forceFoundationValue(pile: any, targetValue: number): void {
    const currentValue = pile.value;
    const cardsToAdd = targetValue - currentValue;
    for (let i = 0; i < cardsToAdd; i++) {
      pile.addCard();
    }
  }


  public setupNearlyFastComplete(
    tableauContainers: Phaser.GameObjects.Container[],
    drawPileCards: Phaser.GameObjects.Image[],
    discardPileCards: Phaser.GameObjects.Image[],
    getCardFrameFromSuit: (suit: string, value: number) => number,
    getCardFrame: (card: any) => number
  ): void {
    console.log('setup scenario near to triggering fast-complete invite');

    // clear game state
    this.#solitaire.tableauPiles.forEach(pile => pile.length = 0);
    this.#solitaire.drawPile.length = 0;
    this.#solitaire.discardPile.length = 0;

    // set all Foundation piles to ace
    const piles = this.#solitaire.foundationPiles;
    piles.forEach(pile => {
      if (pile.value !== 1) {
        this.#forceFoundationValue(pile, 1);
      }
    });

    const suits = [CARD_SUIT.SPADE, CARD_SUIT.HEART, CARD_SUIT.CLUB, CARD_SUIT.DIAMOND];
    // build 4 king-headed tableau (down to card number 4)
    for (let i = 0; i < 4; i++) {
      for (let value = 13; value >= 4; value--) {
        const card = new Card(suits[i], value as CardValue, true);
        this.#solitaire.tableauPiles[i].push(card);
      }
    }

    // build 3 other tableau with 3 and 2
    for (let i = 0; i < 3; i++) {
      const card3 = new Card(suits[i], 3, true);
      const card2 = new Card(suits[i], 2, true);
      this.#solitaire.tableauPiles[4 + i].push(card3);
      this.#solitaire.tableauPiles[4 + i].push(card2);
    }

    // add 4th suit's 2 and 3 to discard pile (2 first, then 3 on top)
    const card2 = new Card(CARD_SUIT.DIAMOND, 2, true);
    const card3 = new Card(CARD_SUIT.DIAMOND, 3, true);
    this.#solitaire.discardPile.push(card2);
    this.#solitaire.discardPile.push(card3);

    this.clearTableauContainers(tableauContainers);

    const STACK_Y_GAP = 28 * 2; // UI_CONFIG.scale is 2
    const OBJECT_SCALE = 1;

    // recreate tableau display (see #createTableauPiles in game-scene)
    this.#solitaire.tableauPiles.forEach((pile, pileIndex) => {
      pile.forEach((card, cardIndex) => {
        const frame = getCardFrameFromSuit(card.suit, card.value);
        const scene = tableauContainers[pileIndex].scene;
        const horizontalShift = 0;

        const cardGO = scene.add
          .image(horizontalShift, cardIndex * STACK_Y_GAP, 'CARDS', frame)
          .setOrigin(0)
          .setInteractive({ draggable: true })
          .setScale(OBJECT_SCALE)
          .setData({
            x: horizontalShift,
            y: cardIndex * STACK_Y_GAP,
            cardIndex,
            pileIndex,
            horizontalShift: horizontalShift
          });
        // console.log(`Created card: pile=${pileIndex}, card=${cardIndex}, frame=${frame}, visible=${cardGO.visible}`);
        tableauContainers[pileIndex].add(cardGO);
      });
    });

    // update discards and deal piles display
    discardPileCards[0].setFrame(getCardFrame(card2)).setVisible(true);
    discardPileCards[1].setFrame(getCardFrame(card3)).setVisible(true);
    drawPileCards.forEach(card => card.setVisible(false));
  }

  public clearTableauContainers(tableauContainers: Phaser.GameObjects.Container[]): void {
    tableauContainers.forEach(container => container.removeAll(true));
  }

  // empties a specific tableau pile (0-6 from left to right)
  public emptyTableau(pileIndex: number): void {
    if (pileIndex < 0 || pileIndex > 6) {
      return;
    }
    this.#solitaire.tableauPiles[pileIndex] = [];
  }

  public clearTableauContainer(pileIndex: number, containers: Phaser.GameObjects.Container[]): void {
    if (pileIndex < 0 || pileIndex > 6) {
      return;
    }
    containers[pileIndex].removeAll(true); // true = destroy children
  }


  // empties tableau pile in both game state and visual display
  public testEmptyTableau(pileIndex: number, containers: Phaser.GameObjects.Container[]): void {
    this.emptyTableau(pileIndex);
    this.clearTableauContainer(pileIndex, containers);
  }


  // empties draw pile in game state and visual display
  public emptyDrawPile(drawPileCards: Phaser.GameObjects.Image[]): void {
    this.#solitaire.drawPile.length = 0;
    drawPileCards.forEach(card => card.setVisible(false));
    console.log('Emptied draw pile');
  }


  // empties Talon in game state and visual GO
  public emptyDiscardPile(discardPileCards: Phaser.GameObjects.Image[]): void {
    this.#solitaire.discardPile.length = 0;
    discardPileCards.forEach(card => card.setVisible(false));
    console.log('Emptied discard pile');
  }


  // King face-up inserted at head of each non-empty tableau pile
  public putKingsOnTableau(containers: Phaser.GameObjects.Container[], getCardFrame: (suit: string, value: number) => number): void {
    const suits = ['SPADE', 'CLUB', 'HEART', 'DIAMOND'];
    let suitIndex = 0;

    this.#solitaire.tableauPiles.forEach((pile, pileIndex) => {
      if (pile.length > 0) {
        const suit = suits[suitIndex % 4];
        const king = new (pile[0].constructor as any)(suit, 13, true);
        pile[0] = king;
  
        const cardGO = containers[pileIndex].getAt<Phaser.GameObjects.Image>(0);
        if (cardGO) {
          cardGO.setFrame(getCardFrame(suit, 13));
        }
        suitIndex++;
      }
    });
    console.log('Kings added to head all non-empty tableau piles');
  }

// flips all cards face-up in all tableau piles
  public flipAllTableauCards(containers: Phaser.GameObjects.Container[], getCardFrame: (card: any) => number): void {
    this.#solitaire.tableauPiles.forEach((pile, pileIndex) => {
      pile.forEach((card, cardIndex) => {
        if (!card.isFaceUp) {
          card.flip();
          const cardGO = containers[pileIndex].getAt<Phaser.GameObjects.Image>(cardIndex);
          if (cardGO) {
            cardGO.setFrame(getCardFrame(card));
          }
        }
      });
    });
    console.log('Flipped face-up all cards in the 4 remaining Tableau stacks');
  }


  // scenario for near-complete condition
  public setupFastCompleteTest(
    containers: Phaser.GameObjects.Container[],
    drawPileCards: Phaser.GameObjects.Image[],
    discardPileCards: Phaser.GameObjects.Image[],
    getCardFrame: (suit: string, value: number) => number,
    getCardFrameFromCard: (card: any) => number
  ): void {
    // empty right-hand 3 tableau piles (indices 4, 5, 6)
    for (let i = 4; i < 7; i++) {
      this.testEmptyTableau(i, containers);
    }
    console.log(`Emptied 3 tableau columns`);

    this.emptyDrawPile(drawPileCards);
    this.emptyDiscardPile(discardPileCards);
    this.putKingsOnTableau(containers, getCardFrame);
    this.flipAllTableauCards(containers, getCardFrameFromCard);

    console.log('All done except drag to foundation piles test setup');
  }
}

import { Solitaire } from './solitaire';
import { CARD_SUIT } from './common';

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


  // empties a specific tableau pile (0-6 from left to right)
  public emptyTableau(pileIndex: number): void {
    if (pileIndex < 0 || pileIndex > 6) {
      return;
    }
    this.#solitaire.tableauPiles[pileIndex] = [];
    console.log(`Emptied tableau column: ${pileIndex}`);
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


  // scenario master for near-complete condition
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

    this.emptyDrawPile(drawPileCards);
    this.emptyDiscardPile(discardPileCards);
    this.putKingsOnTableau(containers, getCardFrame);
    this.flipAllTableauCards(containers, getCardFrameFromCard);

    console.log('All done except drag to foundation piles test setup');
  }
}

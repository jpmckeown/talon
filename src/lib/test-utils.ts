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
}

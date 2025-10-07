import { Card } from './card';


export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


export function countEmptyTableau(tableauPiles: Card[][]): number {
  let count = 0;
  for (const pile of tableauPiles) {
    if (pile.length === 0) {
      count++;
    }
  }
  return count;
}

/**
 * Utility to ensure we handle the full possible range of types when checking a variable for a possible
 * type in a union. An example is when we check for all possible values in a `switch` statement, and we want
 * to ensure we check for all possible values in an enum type object.
 */
export function exhaustiveGuard(_value: never): never {
  throw new Error(`Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}

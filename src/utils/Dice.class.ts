export class Dice {
  private constructor() {}

  static roll(faces: number, rounded: boolean = false): number {
    if (rounded) {
      return Math.floor(Math.random() * faces);
    }

    return Math.random() * faces;
  }
}

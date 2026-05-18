export class Point {
  #x;
  #y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = Point.#validateCoordinate(value, "x");
  }

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = Point.#validateCoordinate(value, "y");
  }

  clone() {
    return new Point(this.x, this.y);
  }

  static #validateCoordinate(value, axisName) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Point ${axisName} coordinate must be a finite number.`);
    }

    return value;
  }
}

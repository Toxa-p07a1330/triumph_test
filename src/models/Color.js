export class Color {
  #r;
  #g;
  #b;

  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  get r() {
    return this.#r;
  }

  set r(value) {
    this.#r = Color.#validateChannel(value, "r");
  }

  get g() {
    return this.#g;
  }

  set g(value) {
    this.#g = Color.#validateChannel(value, "g");
  }

  get b() {
    return this.#b;
  }

  set b(value) {
    this.#b = Color.#validateChannel(value, "b");
  }

  get darkness() {
    return 255 - Math.round((this.r + this.g + this.b) / 3);
  }

  clone() {
    return new Color(this.r, this.g, this.b);
  }

  toRgbString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  static #validateChannel(value, channelName) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new TypeError(`Color ${channelName} channel must be an integer from 0 to 255.`);
    }

    return value;
  }
}

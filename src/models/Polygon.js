import { Color } from "./Color.js";
import { Point } from "./Point.js";

export class Polygon {
  static MIN_CORNERS_AMOUNT = 3;
  static MAX_CORNERS_AMOUNT = 7;
  static APPEAR_ANIMATION_DURATION_MS = 500;
  static #selectedPolygonId = null;
  static #nextId = 1;

  #id;
  #points = [];
  #color;
  #position;
  #isDeleted = false;
  #appearanceAnimationStartTime = null;

  constructor(points, color, position = null) {
    this.#id = Polygon.#nextId;
    Polygon.#nextId += 1;
    this.#setGeometry(points, position);
    this.color = color;
  }

  get id() {
    return this.#id;
  }

  get isSelected() {
    return Polygon.#selectedPolygonId === this.id;
  }

  get points() {
    return this.#points.map(
      (point) => new Point(point.x + this.#position.x, point.y + this.#position.y),
    );
  }

  set points(points) {
    this.#setGeometry(points, this.#position);
  }

  get color() {
    return this.#color;
  }

  set color(color) {
    if (!(color instanceof Color)) {
      throw new TypeError("Polygon color must be a Color instance.");
    }

    this.#color = color;
  }

  get width() {
    const { minX, maxX } = this.#getBounds();
    return maxX - minX;
  }

  get height() {
    const { minY, maxY } = this.#getBounds();
    return maxY - minY;
  }

  get position() {
    return this.#position.clone();
  }

  set position(point) {
    if (!(point instanceof Point)) {
      throw new TypeError("Polygon position must be a Point instance.");
    }

    this.#position = point.clone();
  }

  get isDeleted() {
    return this.#isDeleted;
  }

  set isDeleted(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("Polygon isDeleted flag must be a boolean.");
    }

    this.#isDeleted = value;
  }

  get isAppearing() {
    return this.#appearanceAnimationStartTime !== null;
  }

  getAppearanceProgress(currentTime = performance.now()) {
    if (this.#appearanceAnimationStartTime === null) {
      return 1;
    }

    const elapsedTime = currentTime - this.#appearanceAnimationStartTime;
    return Math.min(1, elapsedTime / Polygon.APPEAR_ANIMATION_DURATION_MS);
  }

  startAppearanceAnimation(startTime = performance.now()) {
    this.#appearanceAnimationStartTime = startTime;
  }

  finishAppearanceAnimation() {
    this.#appearanceAnimationStartTime = null;
  }

  translate(deltaX, deltaY) {
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
      throw new TypeError("Polygon translation delta must be finite numbers.");
    }

    this.#position = new Point(this.#position.x + deltaX, this.#position.y + deltaY);
  }

  #getBounds() {
    const xValues = this.#points.map((point) => point.x);
    const yValues = this.#points.map((point) => point.y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
    };
  }

  #setGeometry(points, position) {
    if (!Array.isArray(points) || points.length < 3) {
      throw new TypeError("Polygon points must be an array of at least 3 Point instances.");
    }

    if (!points.every((point) => point instanceof Point)) {
      throw new TypeError("Polygon points must contain only Point instances.");
    }

    const bounds = Polygon.#getBoundsForPoints(points);
    const basePosition = position instanceof Point ? position.clone() : new Point(bounds.minX, bounds.maxY);

    this.#position = basePosition;
    this.#points = points.map(
      (point) => new Point(point.x - this.#position.x, point.y - this.#position.y),
    );
  }

  static #getBoundsForPoints(points) {
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
    };
  }

  static get selectedPolygonId() {
    return Polygon.#selectedPolygonId;
  }

  static set selectedPolygonId(value) {
    if (value !== null && (!Number.isInteger(value) || value < 1)) {
      throw new TypeError("Polygon selectedPolygonId must be a positive integer or null.");
    }

    Polygon.#selectedPolygonId = value;
  }
}

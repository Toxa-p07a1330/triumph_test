import { Color } from "./Color.js";
import { Point } from "./Point.js";

export class Polygon {
  #points = [];
  #color;

  constructor(points, color) {
    this.points = points;
    this.color = color;
  }

  get points() {
    return this.#points.map((point) => point.clone());
  }

  set points(points) {
    if (!Array.isArray(points) || points.length < 3) {
      throw new TypeError("Polygon points must be an array of at least 3 Point instances.");
    }

    if (!points.every((point) => point instanceof Point)) {
      throw new TypeError("Polygon points must contain only Point instances.");
    }

    this.#points = points.map((point) => point.clone());
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
    const { minX, maxY } = this.#getBounds();
    return new Point(minX, maxY);
  }

  set position(point) {
    if (!(point instanceof Point)) {
      throw new TypeError("Polygon position must be a Point instance.");
    }

    const currentPosition = this.position;
    const deltaX = point.x - currentPosition.x;
    const deltaY = point.y - currentPosition.y;

    this.#points = this.#points.map(
      (polygonPoint) => new Point(polygonPoint.x + deltaX, polygonPoint.y + deltaY),
    );
  }

  translate(deltaX, deltaY) {
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
      throw new TypeError("Polygon translation delta must be finite numbers.");
    }

    this.#points = this.#points.map(
      (point) => new Point(point.x + deltaX, point.y + deltaY),
    );
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
}

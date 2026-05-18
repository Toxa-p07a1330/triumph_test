import { Polygon } from "./Polygon.js";

export class PolygonsArray {
  #items = [];

  constructor(polygons = []) {
    this.items = polygons;
  }

  get items() {
    return [...this.#items];
  }

  set items(polygons) {
    if (!Array.isArray(polygons)) {
      throw new TypeError("PolygonsArray items must be an array of Polygon instances.");
    }

    if (!polygons.every((polygon) => polygon instanceof Polygon)) {
      throw new TypeError("PolygonsArray items must contain only Polygon instances.");
    }

    this.#items = [...polygons];
  }

  get length() {
    return this.#items.length;
  }

  add(polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new TypeError("PolygonsArray can add only Polygon instances.");
    }

    this.#items.push(polygon);
  }

  removeById(polygonId) {
    const polygonIndex = this.#items.findIndex((polygon) => polygon.id === polygonId);

    if (polygonIndex === -1) {
      return null;
    }

    const [removedPolygon] = this.#items.splice(polygonIndex, 1);
    return removedPolygon;
  }

  getById(polygonId) {
    return this.#items.find((polygon) => polygon.id === polygonId) ?? null;
  }

  clear() {
    this.#items = [];
  }

  toArray() {
    return [...this.#items];
  }
}

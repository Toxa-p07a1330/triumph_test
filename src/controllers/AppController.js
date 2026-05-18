import { CanvasController } from "./CanvasController.js";
import {
  Color,
  HistoryRecord,
  HistoryStack,
  Point,
  Polygon,
  PolygonsArray,
} from "../models/index.js";

export class AppController {
  #canvasElement;
  #historyStack;
  #canvasController;
  #polygons;

  constructor(canvasElement) {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError("AppController requires an HTMLCanvasElement.");
    }

    this.#canvasElement = canvasElement;
    this.#historyStack = new HistoryStack();
    this.#canvasController = CanvasController;
    this.#polygons = new PolygonsArray();
  }

  get canvasElement() {
    return this.#canvasElement;
  }

  get historyStack() {
    return this.#historyStack;
  }

  get canvasController() {
    return this.#canvasController;
  }

  get polygons() {
    return this.#polygons;
  }

  render() {
    this.#canvasController.drawPolygons(this.#canvasElement, this.#polygons);
  }

  addRandomTriangle() {
    const triangle = this.#createRandomTriangle();

    this.#polygons.add(triangle);
    this.#historyStack.push(
      new HistoryRecord(HistoryRecord.ACTION_TYPES.CREATE, triangle.id),
    );
    this.render();

    return triangle;
  }

  #createRandomTriangle() {
    const { width, height } = this.#canvasElement.getBoundingClientRect();
    const canvasWidth = Math.max(180, Math.round(width));
    const canvasHeight = Math.max(180, Math.round(height));
    const padding = 20;
    const maxTriangleWidth = Math.max(60, canvasWidth - padding * 2);
    const maxTriangleHeight = Math.max(60, canvasHeight - padding * 2);
    const triangleWidth = AppController.#getRandomInt(60, Math.min(140, maxTriangleWidth));
    const triangleHeight = AppController.#getRandomInt(60, Math.min(140, maxTriangleHeight));
    const positionX = AppController.#getRandomInt(
      padding,
      Math.max(padding, canvasWidth - triangleWidth - padding),
    );
    const positionY = AppController.#getRandomInt(
      triangleHeight + padding,
      Math.max(triangleHeight + padding, canvasHeight - padding),
    );
    const topVertexX = AppController.#getRandomInt(10, Math.max(10, triangleWidth - 10));

    const points = [
      new Point(positionX, positionY),
      new Point(positionX + triangleWidth, positionY),
      new Point(positionX + topVertexX, positionY - triangleHeight),
    ];

    return new Polygon(
      points,
      new Color(
        AppController.#getRandomInt(40, 240),
        AppController.#getRandomInt(40, 240),
        AppController.#getRandomInt(40, 240),
      ),
      new Point(positionX, positionY),
    );
  }

  static #getRandomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }
}

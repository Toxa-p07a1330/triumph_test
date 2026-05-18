import { CanvasController } from "./CanvasController.js";
import { HistoryStack, PolygonsArray } from "../models/index.js";

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
}

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

  addRandomPolygon() {
    const polygon = this.#createRandomPolygon();

    this.#polygons.add(polygon);
    this.#historyStack.push(
      new HistoryRecord(HistoryRecord.ACTION_TYPES.CREATE, polygon.id),
    );
    this.render();

    return polygon;
  }

  #createRandomPolygon() {
    const { width, height } = this.#canvasElement.getBoundingClientRect();
    const canvasWidth = Math.max(180, Math.round(width));
    const canvasHeight = Math.max(180, Math.round(height));
    const padding = 20;
    const polygonCornersAmount = AppController.#getRandomInt(
      Polygon.MIN_CORNERS_AMOUNT,
      Polygon.MAX_CORNERS_AMOUNT,
    );
    const maxPolygonWidth = Math.max(60, canvasWidth - padding * 2);
    const maxPolygonHeight = Math.max(60, canvasHeight - padding * 2);
    const polygonWidth = AppController.#getRandomInt(60, Math.min(140, maxPolygonWidth));
    const polygonHeight = AppController.#getRandomInt(60, Math.min(140, maxPolygonHeight));
    const positionX = AppController.#getRandomInt(
      padding,
      Math.max(padding, canvasWidth - polygonWidth - padding),
    );
    const positionY = AppController.#getRandomInt(
      polygonHeight + padding,
      Math.max(polygonHeight + padding, canvasHeight - padding),
    );
    const points = AppController.#generatePolygonPoints(
      polygonCornersAmount,
      positionX,
      positionY,
      polygonWidth,
      polygonHeight,
    );

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

  static #generatePolygonPoints(cornersAmount, positionX, positionY, polygonWidth, polygonHeight) {
    const points = [
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
    ];

    while (points.length < cornersAmount) {
      const newPoint = AppController.#createRandomAbsolutePoint(
        positionX,
        positionY,
        polygonWidth,
        polygonHeight,
      );
      const [firstClosestIndex, secondClosestIndex] = AppController.#findClosestPointIndices(
        points,
        newPoint,
      );

      AppController.#insertPointBetweenClosest(points, newPoint, firstClosestIndex, secondClosestIndex);
    }

    return points;
  }

  static #createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight) {
    return new Point(
      positionX + AppController.#getRandomInt(0, polygonWidth),
      positionY - AppController.#getRandomInt(0, polygonHeight),
    );
  }

  static #findClosestPointIndices(points, targetPoint) {
    const sortedIndices = points
      .map((point, index) => ({
        index,
        distance: AppController.#getDistance(point, targetPoint),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 2)
      .map(({ index }) => index);

    return sortedIndices;
  }

  static #insertPointBetweenClosest(points, newPoint, firstIndex, secondIndex) {
    const pointsAmount = points.length;
    const normalizedFirstIndex = Math.min(firstIndex, secondIndex);
    const normalizedSecondIndex = Math.max(firstIndex, secondIndex);
    const areEdgeNeighbours =
      normalizedSecondIndex - normalizedFirstIndex === 1
      || (normalizedFirstIndex === 0 && normalizedSecondIndex === pointsAmount - 1);

    if (areEdgeNeighbours && normalizedFirstIndex === 0 && normalizedSecondIndex === pointsAmount - 1) {
      points.push(newPoint);
      return;
    }

    if (areEdgeNeighbours) {
      points.splice(normalizedSecondIndex, 0, newPoint);
      return;
    }

    points.splice(normalizedSecondIndex, 0, newPoint);
  }

  static #getDistance(firstPoint, secondPoint) {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
  }

  static #getRandomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }
}

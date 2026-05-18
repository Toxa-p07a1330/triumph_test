import { CanvasController } from "./CanvasController.js";
import {
  Color,
  HistoryRecord,
  HistoryStack,
  Point,
  Polygon,
  PolygonsArray,
} from "../models/index.js";
import { GeometryHelper } from "../helpers/index.js";

export class AppController {
  #canvasElement;
  #historyStack;
  #redoStack;
  #canvasController;
  #polygons;

  constructor(canvasElement) {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError("AppController requires an HTMLCanvasElement.");
    }

    this.#canvasElement = canvasElement;
    this.#historyStack = new HistoryStack();
    this.#redoStack = new HistoryStack();
    this.#canvasController = CanvasController;
    this.#polygons = new PolygonsArray();
  }

  get canvasElement() {
    return this.#canvasElement;
  }

  get historyStack() {
    return this.#historyStack;
  }

  get redoStack() {
    return this.#redoStack;
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
    this.#pushHistoryRecord(
      new HistoryRecord(HistoryRecord.ACTION_TYPES.CREATE, polygon.id),
    );
    this.render();

    return polygon;
  }

  deleteSelectedPolygon() {
    const selectedPolygonId = Polygon.selectedPolygonId;

    if (selectedPolygonId === null) {
      return false;
    }

    const polygon = this.#polygons.getById(selectedPolygonId);

    if (polygon === null || polygon.isDeleted) {
      Polygon.selectedPolygonId = null;
      this.render();
      return false;
    }

    polygon.isDeleted = true;
    this.#pushHistoryRecord(
      new HistoryRecord(
        HistoryRecord.ACTION_TYPES.DELETE,
        polygon.id,
        { isDeleted: false },
        { isDeleted: true },
      ),
    );
    Polygon.selectedPolygonId = null;
    this.render();

    return true;
  }

  undo() {
    const historyRecord = this.#historyStack.pop();

    if (historyRecord === null) {
      return false;
    }

    this.#applyHistoryRecord(historyRecord, false);
    this.#redoStack.push(historyRecord);
    Polygon.selectedPolygonId = null;
    this.render();

    return true;
  }

  redo() {
    const historyRecord = this.#redoStack.pop();

    if (historyRecord === null) {
      return false;
    }

    this.#applyHistoryRecord(historyRecord, true);
    this.#historyStack.push(historyRecord);
    Polygon.selectedPolygonId = null;
    this.render();

    return true;
  }

  selectPolygonAtPoint(targetPoint) {
    if (!(targetPoint instanceof Point)) {
      throw new TypeError("AppController selectPolygonAtPoint requires a Point instance.");
    }

    const polygons = this.#polygons.items.filter((polygon) => !polygon.isDeleted);
    let selectedPolygonId = null;

    for (let polygonIndex = polygons.length - 1; polygonIndex >= 0; polygonIndex -= 1) {
      const polygon = polygons[polygonIndex];

      if (GeometryHelper.isPointInPolygon(targetPoint, polygon.points)) {
        selectedPolygonId = polygon.id;
        break;
      }
    }

    Polygon.selectedPolygonId = selectedPolygonId;
    this.render();

    return selectedPolygonId;
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

  #pushHistoryRecord(historyRecord) {
    this.#historyStack.push(historyRecord);
    this.#redoStack.clear();
  }

  #applyHistoryRecord(historyRecord, useNewProperties) {
    const polygon = this.#polygons.getById(historyRecord.polygonId);

    if (polygon === null) {
      return;
    }

    switch (historyRecord.actionType) {
      case HistoryRecord.ACTION_TYPES.CREATE:
        polygon.isDeleted = !useNewProperties;
        break;
      case HistoryRecord.ACTION_TYPES.DELETE: {
        const properties = useNewProperties
          ? historyRecord.newProperties
          : historyRecord.oldProperties;

        if (properties !== null && typeof properties.isDeleted === "boolean") {
          polygon.isDeleted = properties.isDeleted;
        }
        break;
      }
      default:
        break;
    }
  }

  static #generatePolygonPoints(cornersAmount, positionX, positionY, polygonWidth, polygonHeight) {
    const points = [
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
      AppController.#createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight),
    ];

    while (points.length < cornersAmount) {
      let nextPointAdded = false;
      let generationAttempts = 0;

      while (!nextPointAdded && generationAttempts < 100) {
        const newPoint = AppController.#createRandomAbsolutePoint(
          positionX,
          positionY,
          polygonWidth,
          polygonHeight,
        );
        const insertionIndex = AppController.#findNearestEdgeInsertionIndex(
          points,
          newPoint,
        );
        const candidatePoints = [...points];

        candidatePoints.splice(insertionIndex, 0, newPoint);

        if (!GeometryHelper.hasSelfIntersections(candidatePoints)) {
          points.splice(insertionIndex, 0, newPoint);
          nextPointAdded = true;
        }

        generationAttempts += 1;
      }

      if (!nextPointAdded) {
        break;
      }
    }

    return points;
  }

  static #createRandomAbsolutePoint(positionX, positionY, polygonWidth, polygonHeight) {
    return new Point(
      positionX + AppController.#getRandomInt(0, polygonWidth),
      positionY - AppController.#getRandomInt(0, polygonHeight),
    );
  }

  static #findNearestEdgeInsertionIndex(points, targetPoint) {
    let nearestEdgeStartIndex = 0;
    let nearestEdgeDistance = Number.POSITIVE_INFINITY;

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      const nextPointIndex = (pointIndex + 1) % points.length;
      const distance = GeometryHelper.getPointToSegmentDistance(
        targetPoint,
        points[pointIndex],
        points[nextPointIndex],
      );

      if (distance < nearestEdgeDistance) {
        nearestEdgeDistance = distance;
        nearestEdgeStartIndex = pointIndex;
      }
    }

    return nearestEdgeStartIndex + 1;
  }

  static #getRandomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }
}

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
  #dragState = null;

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

  get isDraggingPolygon() {
    return this.#dragState !== null;
  }

  get canvasController() {
    return this.#canvasController;
  }

  get polygons() {
    return this.#polygons;
  }

  get selectedPolygon() {
    if (Polygon.selectedPolygonId === null) {
      return null;
    }

    return this.#polygons.getById(Polygon.selectedPolygonId);
  }

  render() {
    this.#canvasController.drawPolygons(this.#canvasElement, this.#polygons);
  }

  addRandomPolygon() {
    const polygon = this.#createRandomPolygon();

    if (polygon === null) {
      return null;
    }

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

  recolorSelectedPolygon(color) {
    if (!(color instanceof Color)) {
      throw new TypeError("AppController recolorSelectedPolygon requires a Color instance.");
    }

    const polygon = this.selectedPolygon;

    if (polygon === null || polygon.isDeleted) {
      return false;
    }

    const oldColor = polygon.color.clone();

    if (oldColor.r === color.r && oldColor.g === color.g && oldColor.b === color.b) {
      return false;
    }

    polygon.color = color.clone();
    this.#pushHistoryRecord(
      new HistoryRecord(
        HistoryRecord.ACTION_TYPES.RECOLORED,
        polygon.id,
        {
          color: {
            r: oldColor.r,
            g: oldColor.g,
            b: oldColor.b,
          },
        },
        {
          color: {
            r: color.r,
            g: color.g,
            b: color.b,
          },
        },
      ),
    );
    this.render();

    return true;
  }

  beginPolygonDrag(targetPoint) {
    if (!(targetPoint instanceof Point)) {
      throw new TypeError("AppController beginPolygonDrag requires a Point instance.");
    }

    const polygon = this.#getPolygonAtPoint(targetPoint);

    if (polygon === null) {
      Polygon.selectedPolygonId = null;
      this.#dragState = null;
      this.render();
      return false;
    }

    Polygon.selectedPolygonId = polygon.id;
    this.#dragState = {
      polygonId: polygon.id,
      startMousePoint: targetPoint.clone(),
      startPosition: polygon.position,
      lastValidPosition: polygon.position,
      hasMoved: false,
    };
    this.render();

    return true;
  }

  updatePolygonDrag(targetPoint) {
    if (!(targetPoint instanceof Point)) {
      throw new TypeError("AppController updatePolygonDrag requires a Point instance.");
    }

    if (this.#dragState === null) {
      return false;
    }

    const polygon = this.#polygons.getById(this.#dragState.polygonId);

    if (polygon === null || polygon.isDeleted) {
      this.#dragState = null;
      return false;
    }

    const deltaX = targetPoint.x - this.#dragState.startMousePoint.x;
    const deltaY = targetPoint.y - this.#dragState.startMousePoint.y;
    const boundedPosition = this.#getBoundedPolygonPosition(
      polygon,
      new Point(
        this.#dragState.startPosition.x + deltaX,
        this.#dragState.startPosition.y + deltaY,
      ),
    );

    polygon.position = boundedPosition;

    if (this.#overlapsExistingPolygons(polygon, polygon.id)) {
      polygon.position = this.#dragState.lastValidPosition;
      return false;
    }

    this.#dragState.lastValidPosition = boundedPosition;
    this.#dragState.hasMoved =
      boundedPosition.x !== this.#dragState.startPosition.x
      || boundedPosition.y !== this.#dragState.startPosition.y;
    this.render();

    return true;
  }

  endPolygonDrag() {
    if (this.#dragState === null) {
      return false;
    }

    const polygon = this.#polygons.getById(this.#dragState.polygonId);

    if (polygon !== null && this.#dragState.hasMoved) {
      this.#pushHistoryRecord(
        new HistoryRecord(
          HistoryRecord.ACTION_TYPES.MOVED,
          polygon.id,
          {
            position: {
              x: this.#dragState.startPosition.x,
              y: this.#dragState.startPosition.y,
            },
          },
          {
            position: {
              x: this.#dragState.lastValidPosition.x,
              y: this.#dragState.lastValidPosition.y,
            },
          },
        ),
      );
    }

    this.#dragState = null;
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

    const polygon = this.#getPolygonAtPoint(targetPoint);
    const selectedPolygonId = polygon?.id ?? null;

    Polygon.selectedPolygonId = selectedPolygonId;
    this.render();

    return selectedPolygonId;
  }

  #createRandomPolygon() {
    let polygon = null;
    let generationAttempts = 0;

    while (polygon === null && generationAttempts < 100) {
      const candidatePolygon = this.#createPolygonCandidate();

      if (!this.#overlapsExistingPolygons(candidatePolygon)) {
        polygon = candidatePolygon;
      }

      generationAttempts += 1;
    }

    return polygon;
  }

  #createPolygonCandidate() {
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

  #overlapsExistingPolygons(candidatePolygon, ignoredPolygonId = null) {
    return this.#polygons.items
      .filter((polygon) => !polygon.isDeleted && polygon.id !== ignoredPolygonId)
      .some((polygon) => GeometryHelper.polygonsOverlap(candidatePolygon.points, polygon.points));
  }

  #getPolygonAtPoint(targetPoint) {
    const polygons = this.#polygons.items.filter((polygon) => !polygon.isDeleted);

    for (let polygonIndex = polygons.length - 1; polygonIndex >= 0; polygonIndex -= 1) {
      const polygon = polygons[polygonIndex];

      if (GeometryHelper.isPointInPolygon(targetPoint, polygon.points)) {
        return polygon;
      }
    }

    return null;
  }

  #getBoundedPolygonPosition(polygon, candidatePosition) {
    const { width, height } = this.#canvasElement.getBoundingClientRect();
    const canvasWidth = Math.max(1, Math.round(width));
    const canvasHeight = Math.max(1, Math.round(height));

    return new Point(
      Math.min(Math.max(0, candidatePosition.x), Math.max(0, canvasWidth - polygon.width)),
      Math.min(Math.max(polygon.height, candidatePosition.y), canvasHeight),
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
      case HistoryRecord.ACTION_TYPES.MOVED: {
        const properties = useNewProperties
          ? historyRecord.newProperties
          : historyRecord.oldProperties;

        if (
          properties !== null
          && properties.position !== undefined
          && Number.isFinite(properties.position.x)
          && Number.isFinite(properties.position.y)
        ) {
          polygon.position = new Point(properties.position.x, properties.position.y);
        }
        break;
      }
      case HistoryRecord.ACTION_TYPES.RECOLORED: {
        const properties = useNewProperties
          ? historyRecord.newProperties
          : historyRecord.oldProperties;

        if (
          properties !== null
          && properties.color !== undefined
          && Number.isInteger(properties.color.r)
          && Number.isInteger(properties.color.g)
          && Number.isInteger(properties.color.b)
        ) {
          polygon.color = new Color(
            properties.color.r,
            properties.color.g,
            properties.color.b,
          );
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

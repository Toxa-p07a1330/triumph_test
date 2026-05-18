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

        if (!AppController.#hasSelfIntersections(candidatePoints)) {
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
      const distance = AppController.#getPointToSegmentDistance(
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

  static #getDistance(firstPoint, secondPoint) {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
  }

  static #getPointToSegmentDistance(targetPoint, segmentStartPoint, segmentEndPoint) {
    const segmentVectorX = segmentEndPoint.x - segmentStartPoint.x;
    const segmentVectorY = segmentEndPoint.y - segmentStartPoint.y;
    const pointVectorX = targetPoint.x - segmentStartPoint.x;
    const pointVectorY = targetPoint.y - segmentStartPoint.y;
    const segmentLengthSquared = segmentVectorX ** 2 + segmentVectorY ** 2;

    if (segmentLengthSquared === 0) {
      return AppController.#getDistance(targetPoint, segmentStartPoint);
    }

    const projectionFactor = Math.max(
      0,
      Math.min(
        1,
        (pointVectorX * segmentVectorX + pointVectorY * segmentVectorY) / segmentLengthSquared,
      ),
    );
    const projectionX = segmentStartPoint.x + projectionFactor * segmentVectorX;
    const projectionY = segmentStartPoint.y + projectionFactor * segmentVectorY;

    return Math.hypot(targetPoint.x - projectionX, targetPoint.y - projectionY);
  }

  static #hasSelfIntersections(points) {
    for (let firstEdgeStartIndex = 0; firstEdgeStartIndex < points.length; firstEdgeStartIndex += 1) {
      const firstEdgeEndIndex = (firstEdgeStartIndex + 1) % points.length;

      for (
        let secondEdgeStartIndex = firstEdgeStartIndex + 1;
        secondEdgeStartIndex < points.length;
        secondEdgeStartIndex += 1
      ) {
        const secondEdgeEndIndex = (secondEdgeStartIndex + 1) % points.length;

        if (
          firstEdgeStartIndex === secondEdgeStartIndex
          || firstEdgeStartIndex === secondEdgeEndIndex
          || firstEdgeEndIndex === secondEdgeStartIndex
          || firstEdgeEndIndex === secondEdgeEndIndex
        ) {
          continue;
        }

        if (
          AppController.#segmentsIntersect(
            points[firstEdgeStartIndex],
            points[firstEdgeEndIndex],
            points[secondEdgeStartIndex],
            points[secondEdgeEndIndex],
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  static #segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd) {
    const firstOrientation = AppController.#getOrientation(firstStart, firstEnd, secondStart);
    const secondOrientation = AppController.#getOrientation(firstStart, firstEnd, secondEnd);
    const thirdOrientation = AppController.#getOrientation(secondStart, secondEnd, firstStart);
    const fourthOrientation = AppController.#getOrientation(secondStart, secondEnd, firstEnd);

    if (firstOrientation === 0 && AppController.#isPointOnSegment(secondStart, firstStart, firstEnd)) {
      return true;
    }

    if (secondOrientation === 0 && AppController.#isPointOnSegment(secondEnd, firstStart, firstEnd)) {
      return true;
    }

    if (thirdOrientation === 0 && AppController.#isPointOnSegment(firstStart, secondStart, secondEnd)) {
      return true;
    }

    if (fourthOrientation === 0 && AppController.#isPointOnSegment(firstEnd, secondStart, secondEnd)) {
      return true;
    }

    return firstOrientation !== secondOrientation && thirdOrientation !== fourthOrientation;
  }

  static #getOrientation(firstPoint, secondPoint, thirdPoint) {
    const crossProduct =
      (secondPoint.y - firstPoint.y) * (thirdPoint.x - secondPoint.x)
      - (secondPoint.x - firstPoint.x) * (thirdPoint.y - secondPoint.y);

    if (Math.abs(crossProduct) < Number.EPSILON) {
      return 0;
    }

    return crossProduct > 0 ? 1 : 2;
  }

  static #isPointOnSegment(targetPoint, segmentStartPoint, segmentEndPoint) {
    return (
      targetPoint.x <= Math.max(segmentStartPoint.x, segmentEndPoint.x)
      && targetPoint.x >= Math.min(segmentStartPoint.x, segmentEndPoint.x)
      && targetPoint.y <= Math.max(segmentStartPoint.y, segmentEndPoint.y)
      && targetPoint.y >= Math.min(segmentStartPoint.y, segmentEndPoint.y)
    );
  }

  static #getRandomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }
}

import { PolygonsArray } from "../models/PolygonsArray.js";
import { Polygon } from "../models/Polygon.js";

export class CanvasController {
  static drawPolygons(canvasElement, polygons) {
    const context = CanvasController.#getContext(canvasElement);
    CanvasController.#syncCanvasSize(canvasElement, context);
    CanvasController.clear(canvasElement);

    if (!(polygons instanceof PolygonsArray)) {
      throw new TypeError("CanvasController can draw only PolygonsArray instances.");
    }

    polygons.items
      .filter((polygon) => !polygon.isDeleted)
      .forEach((polygon) => CanvasController.drawPolygon(canvasElement, polygon));
  }

  static drawPolygon(canvasElement, polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new TypeError("CanvasController can draw only Polygon instances.");
    }

    const context = CanvasController.#getContext(canvasElement);
    const points = CanvasController.#getRenderablePoints(polygon);

    if (points.length < 3) {
      return;
    }

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
      context.lineTo(points[pointIndex].x, points[pointIndex].y);
    }

    context.closePath();
    context.fillStyle = polygon.color.toRgbString();
    context.fill();

    if (polygon.isSelected) {
      context.strokeStyle = CanvasController.#getStrokeColor(polygon);
      context.lineWidth = 4;
      context.stroke();
    }
  }

  static clear(canvasElement) {
    const context = CanvasController.#getContext(canvasElement);
    CanvasController.#syncCanvasSize(canvasElement, context);
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  static #getContext(canvasElement) {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError("CanvasController requires an HTMLCanvasElement.");
    }

    const context = canvasElement.getContext("2d");

    if (context === null) {
      throw new Error("2D canvas context is not available.");
    }

    return context;
  }

  static #syncCanvasSize(canvasElement, context) {
    const { width, height } = canvasElement.getBoundingClientRect();
    const resolvedWidth = Math.max(1, Math.round(width));
    const resolvedHeight = Math.max(1, Math.round(height));

    if (canvasElement.width !== resolvedWidth || canvasElement.height !== resolvedHeight) {
      canvasElement.width = resolvedWidth;
      canvasElement.height = resolvedHeight;
      context.imageSmoothingEnabled = true;
    }
  }

  static #getStrokeColor(polygon) {
    if (!polygon.isSelected) {
      return "transparent";
    }

    const darkenFactor = 0.65;
    const strokeRed = Math.max(0, Math.round(polygon.color.r * darkenFactor));
    const strokeGreen = Math.max(0, Math.round(polygon.color.g * darkenFactor));
    const strokeBlue = Math.max(0, Math.round(polygon.color.b * darkenFactor));

    return `rgb(${strokeRed}, ${strokeGreen}, ${strokeBlue})`;
  }

  static #getRenderablePoints(polygon) {
    const points = polygon.points;

    if (!polygon.isAppearing) {
      return points;
    }

    const progress = polygon.getAppearanceProgress();
    const easedProgress = 1 - (1 - progress) ** 3;

    if (progress >= 1) {
      polygon.finishAppearanceAnimation();
      return points;
    }

    const anchorX = Math.min(...points.map((point) => point.x)) + polygon.width / 2;
    const anchorY = polygon.position.y;
    const scaleX = 1.12 - 0.12 * easedProgress;
    const scaleY = 0.12 + 0.88 * easedProgress;

    return points.map((point) => ({
      x: anchorX + (point.x - anchorX) * scaleX,
      y: anchorY + (point.y - anchorY) * scaleY,
    }));
  }
}

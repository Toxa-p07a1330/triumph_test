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
    const points = polygon.points;

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
    context.strokeStyle = CanvasController.#getStrokeColor(polygon);
    context.lineWidth = polygon.isSelected ? 4 : 2;
    context.fill();
    context.stroke();
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
    if (polygon.isSelected) {
      return "rgb(234, 179, 8)";
    }

    return polygon.color.darkness > 127 ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)";
  }
}

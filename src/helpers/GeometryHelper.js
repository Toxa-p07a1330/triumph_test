export class GeometryHelper {
  static isPointInPolygon(targetPoint, polygonPoints) {
    let isInside = false;

    for (
      let currentPointIndex = 0, previousPointIndex = polygonPoints.length - 1;
      currentPointIndex < polygonPoints.length;
      previousPointIndex = currentPointIndex, currentPointIndex += 1
    ) {
      const currentPoint = polygonPoints[currentPointIndex];
      const previousPoint = polygonPoints[previousPointIndex];
      const intersectsHorizontalRay =
        (currentPoint.y > targetPoint.y) !== (previousPoint.y > targetPoint.y)
        && targetPoint.x
          < ((previousPoint.x - currentPoint.x) * (targetPoint.y - currentPoint.y))
            / (previousPoint.y - currentPoint.y)
            + currentPoint.x;

      if (intersectsHorizontalRay) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  static getDistance(firstPoint, secondPoint) {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
  }

  static getPointToSegmentDistance(targetPoint, segmentStartPoint, segmentEndPoint) {
    const segmentVectorX = segmentEndPoint.x - segmentStartPoint.x;
    const segmentVectorY = segmentEndPoint.y - segmentStartPoint.y;
    const pointVectorX = targetPoint.x - segmentStartPoint.x;
    const pointVectorY = targetPoint.y - segmentStartPoint.y;
    const segmentLengthSquared = segmentVectorX ** 2 + segmentVectorY ** 2;

    if (segmentLengthSquared === 0) {
      return GeometryHelper.getDistance(targetPoint, segmentStartPoint);
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

  static hasSelfIntersections(points) {
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
          GeometryHelper.segmentsIntersect(
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

  static segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd) {
    const firstOrientation = GeometryHelper.getOrientation(firstStart, firstEnd, secondStart);
    const secondOrientation = GeometryHelper.getOrientation(firstStart, firstEnd, secondEnd);
    const thirdOrientation = GeometryHelper.getOrientation(secondStart, secondEnd, firstStart);
    const fourthOrientation = GeometryHelper.getOrientation(secondStart, secondEnd, firstEnd);

    if (firstOrientation === 0 && GeometryHelper.isPointOnSegment(secondStart, firstStart, firstEnd)) {
      return true;
    }

    if (secondOrientation === 0 && GeometryHelper.isPointOnSegment(secondEnd, firstStart, firstEnd)) {
      return true;
    }

    if (thirdOrientation === 0 && GeometryHelper.isPointOnSegment(firstStart, secondStart, secondEnd)) {
      return true;
    }

    if (fourthOrientation === 0 && GeometryHelper.isPointOnSegment(firstEnd, secondStart, secondEnd)) {
      return true;
    }

    return firstOrientation !== secondOrientation && thirdOrientation !== fourthOrientation;
  }

  static getOrientation(firstPoint, secondPoint, thirdPoint) {
    const crossProduct =
      (secondPoint.y - firstPoint.y) * (thirdPoint.x - secondPoint.x)
      - (secondPoint.x - firstPoint.x) * (thirdPoint.y - secondPoint.y);

    if (Math.abs(crossProduct) < Number.EPSILON) {
      return 0;
    }

    return crossProduct > 0 ? 1 : 2;
  }

  static isPointOnSegment(targetPoint, segmentStartPoint, segmentEndPoint) {
    return (
      targetPoint.x <= Math.max(segmentStartPoint.x, segmentEndPoint.x)
      && targetPoint.x >= Math.min(segmentStartPoint.x, segmentEndPoint.x)
      && targetPoint.y <= Math.max(segmentStartPoint.y, segmentEndPoint.y)
      && targetPoint.y >= Math.min(segmentStartPoint.y, segmentEndPoint.y)
    );
  }
}

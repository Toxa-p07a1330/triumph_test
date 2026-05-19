import "./components/PolygonEditorApp.js";
import { AppController } from "./controllers/index.js";
import { Point } from "./models/index.js";

const appElement = document.querySelector("polygon-editor-app");

if (appElement !== null) {
  window.addEventListener("DOMContentLoaded", () => {
    const appController = new AppController(appElement.canvasComponent.canvasElement);
    const {
      addPolygonButton,
      deleteSelectedButton,
      undoButton,
      redoButton,
    } = appElement.controlPanelComponent;
    const canvasElement = appElement.canvasComponent.canvasElement;
    const getCanvasPoint = (event) => {
      const canvasRect = canvasElement.getBoundingClientRect();

      return new Point(
        event.clientX - canvasRect.left,
        event.clientY - canvasRect.top,
      );
    };

    addPolygonButton.addEventListener("click", () => {
      const polygon = appController.addRandomPolygon();

      if (polygon === null) {
        alert("Не удалось добавить полигон");
      }
    });

    deleteSelectedButton.addEventListener("click", () => {
      appController.deleteSelectedPolygon();
    });

    undoButton.addEventListener("click", () => {
      appController.undo();
    });

    redoButton.addEventListener("click", () => {
      appController.redo();
    });

    canvasElement.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        return;
      }

      appController.beginPolygonDrag(getCanvasPoint(event));
    });

    window.addEventListener("mousemove", (event) => {
      if (!appController.isDraggingPolygon) {
        return;
      }

      appController.updatePolygonDrag(getCanvasPoint(event));
    });

    window.addEventListener("mouseup", () => {
      if (!appController.isDraggingPolygon) {
        return;
      }

      appController.endPolygonDrag();
    });

    appController.render();
  });
}

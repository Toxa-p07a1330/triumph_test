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

    addPolygonButton.addEventListener("click", () => {
      appController.addRandomPolygon();
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

    appElement.canvasComponent.canvasElement.addEventListener("click", (event) => {
      const canvasRect = appElement.canvasComponent.canvasElement.getBoundingClientRect();
      const point = new Point(
        event.clientX - canvasRect.left,
        event.clientY - canvasRect.top,
      );

      appController.selectPolygonAtPoint(point);
    });

    appController.render();
  });
}

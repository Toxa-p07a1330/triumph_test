import "./components/PolygonEditorApp.js";
import { AppController } from "./controllers/index.js";
import { Color, Point } from "./models/index.js";

const appElement = document.querySelector("polygon-editor-app");

if (appElement !== null) {
  window.addEventListener("DOMContentLoaded", () => {
    const appController = new AppController(appElement.canvasComponent.canvasElement);
    const {
      addPolygonButton,
      deleteSelectedButton,
      undoButton,
      redoButton,
      colorInput,
      recolorSelectedButton,
    } = appElement.controlPanelComponent;
    const canvasElement = appElement.canvasComponent.canvasElement;
    const getCanvasPoint = (event) => {
      const canvasRect = canvasElement.getBoundingClientRect();

      return new Point(
        event.clientX - canvasRect.left,
        event.clientY - canvasRect.top,
      );
    };
    const toHex = (value) => value.toString(16).padStart(2, "0");
    const syncSelectedPolygonColor = () => {
      const selectedPolygon = appController.selectedPolygon;

      if (selectedPolygon === null || selectedPolygon.isDeleted) {
        return;
      }

      colorInput.value = `#${toHex(selectedPolygon.color.r)}${toHex(selectedPolygon.color.g)}${toHex(selectedPolygon.color.b)}`;
    };

    addPolygonButton.addEventListener("click", () => {
      const polygon = appController.addRandomPolygon();

      if (polygon === null) {
        alert("Ну удалось добавить полигон");
      }

      syncSelectedPolygonColor();
    });

    deleteSelectedButton.addEventListener("click", () => {
      appController.deleteSelectedPolygon();
      syncSelectedPolygonColor();
    });

    undoButton.addEventListener("click", () => {
      appController.undo();
      syncSelectedPolygonColor();
    });

    redoButton.addEventListener("click", () => {
      appController.redo();
      syncSelectedPolygonColor();
    });

    recolorSelectedButton.addEventListener("click", () => {
      const hexColor = colorInput.value.replace("#", "");

      appController.recolorSelectedPolygon(
        new Color(
          Number.parseInt(hexColor.slice(0, 2), 16),
          Number.parseInt(hexColor.slice(2, 4), 16),
          Number.parseInt(hexColor.slice(4, 6), 16),
        ),
      );
      syncSelectedPolygonColor();
    });

    canvasElement.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        return;
      }

      appController.beginPolygonDrag(getCanvasPoint(event));
      syncSelectedPolygonColor();
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
      syncSelectedPolygonColor();
    });

    appController.render();
    syncSelectedPolygonColor();
  });
}

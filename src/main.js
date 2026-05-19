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
      deleteAllButton,
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
    const syncInfoPanel = () => {
      const activePolygonsCount = appController.polygons.items.filter((polygon) => !polygon.isDeleted).length;
      const selectedPolygon = appController.selectedPolygon;

      appElement.controlPanelComponent.polygonsCount = activePolygonsCount;
      appElement.controlPanelComponent.selectedPolygonName =
        selectedPolygon !== null && !selectedPolygon.isDeleted
          ? String(selectedPolygon.id)
          : "Ничего не выбрано";
    };
    const syncUi = () => {
      syncSelectedPolygonColor();
      syncInfoPanel();
    };

    addPolygonButton.addEventListener("click", () => {
      const polygon = appController.addRandomPolygon();

      if (polygon === null) {
        alert("Не удалось добавить полигон");
      }

      syncUi();
    });

    deleteSelectedButton.addEventListener("click", () => {
      const isDeleted = appController.deleteSelectedPolygon();

      if (!isDeleted) {
        alert("Ничего не выбрано");
      }

      syncUi();
    });

    deleteAllButton.addEventListener("click", () => {
      appController.deleteAllPolygons();
      syncUi();
    });

    undoButton.addEventListener("click", () => {
      appController.undo();
      syncUi();
    });

    redoButton.addEventListener("click", () => {
      appController.redo();
      syncUi();
    });

    recolorSelectedButton.addEventListener("click", () => {
      const hexColor = colorInput.value.replace("#", "");

      const isRecolored = appController.recolorSelectedPolygon(
        new Color(
          Number.parseInt(hexColor.slice(0, 2), 16),
          Number.parseInt(hexColor.slice(2, 4), 16),
          Number.parseInt(hexColor.slice(4, 6), 16),
        ),
      );

      if (!isRecolored) {
        alert("Ничего не выбрано");
      }

      syncUi();
    });

    canvasElement.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        return;
      }

      appController.beginPolygonDrag(getCanvasPoint(event));
      syncUi();
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
      syncUi();
    });

    window.addEventListener("keydown", (event) => {
      if (!event.ctrlKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "z") {
        event.preventDefault();
        appController.undo();
        syncUi();
        return;
      }

      if (key === "y") {
        event.preventDefault();
        appController.redo();
        syncUi();
      }
    });

    appController.render();
    syncUi();
  });
}

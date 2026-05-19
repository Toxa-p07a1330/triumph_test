import "./components/PolygonEditorApp.js";
import { AppController } from "./controllers/index.js";
import { Color, Point } from "./models/index.js";

const appElement = document.querySelector("polygon-editor-app");

if (appElement !== null) {
  window.addEventListener("DOMContentLoaded", () => {
    const appController = new AppController(appElement.canvasComponent.canvasElement);
    const {
      addPolygonButton,
      importJsonButton,
      exportJsonButton,
      deleteSelectedButton,
      deleteAllButton,
      undoButton,
      redoButton,
      colorInput,
      recolorSelectedButton,
    } = appElement.controlPanelComponent;
    const canvasElement = appElement.canvasComponent.canvasElement;
    const importInput = document.createElement("input");

    importInput.type = "file";
    importInput.accept = ".json,application/json";
    importInput.hidden = true;
    document.body.appendChild(importInput);

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
    const syncHistoryButtons = () => {
      appElement.controlPanelComponent.undoDisabled = !appController.canUndo;
      appElement.controlPanelComponent.redoDisabled = !appController.canRedo;
    };
    const syncUi = () => {
      syncSelectedPolygonColor();
      syncInfoPanel();
      syncHistoryButtons();
    };
    const downloadJson = (content) => {
      const fileUrl = URL.createObjectURL(
        new Blob([content], { type: "application/json;charset=utf-8" }),
      );
      const downloadLink = document.createElement("a");

      downloadLink.href = fileUrl;
      downloadLink.download = "polygons.json";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(fileUrl);
    };

    addPolygonButton.addEventListener("click", () => {
      const polygon = appController.addRandomPolygon();

      if (polygon === null) {
        alert("Не удалось добавить полигон");
      }

      syncUi();
    });

    importJsonButton.addEventListener("click", () => {
      importInput.value = "";
      importInput.click();
    });

    exportJsonButton.addEventListener("click", () => {
      downloadJson(appController.exportToJson());
    });

    importInput.addEventListener("change", async () => {
      const [selectedFile] = importInput.files ?? [];

      if (selectedFile === undefined) {
        return;
      }

      try {
        const jsonContent = await selectedFile.text();

        appController.importFromJson(jsonContent);
        syncUi();
      } catch {
        alert("Не удалось импортировать JSON");
      }
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

      const pressedKey = event.key.toLowerCase();

      if (pressedKey === "z") {
        event.preventDefault();
        appController.undo();
        syncUi();
        return;
      }

      if (pressedKey === "y") {
        event.preventDefault();
        appController.redo();
        syncUi();
      }
    });

    appController.render();
    syncUi();
  });
}

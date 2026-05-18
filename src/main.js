import "./components/PolygonEditorApp.js";
import { AppController } from "./controllers/index.js";

const appElement = document.querySelector("polygon-editor-app");

if (appElement !== null) {
  window.addEventListener("DOMContentLoaded", () => {
    const appController = new AppController(appElement.canvasComponent.canvasElement);
    const { addPolygonButton } = appElement.controlPanelComponent;

    addPolygonButton.addEventListener("click", () => {
      appController.addRandomTriangle();
    });

    appController.render();
  });
}

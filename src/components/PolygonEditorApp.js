import "./PolygonCanvas.js";
import "./PolygonControlPanel.js";

const appTemplate = document.createElement("template");

appTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 100vh;
      color: #0f172a;
      background:
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), rgba(224, 232, 240, 0.9) 48%, rgba(203, 213, 225, 0.9) 100%);
      font-family: "Segoe UI", sans-serif;
    }

    .layout {
      display: grid;
      grid-template-rows: minmax(0, 1fr) 100px;
      min-height: 100vh;
    }
  </style>
  <main class="layout">
    <polygon-canvas></polygon-canvas>
    <polygon-control-panel></polygon-control-panel>
  </main>
`;

export class PolygonEditorApp extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(appTemplate.content.cloneNode(true));
  }
}

customElements.define("polygon-editor-app", PolygonEditorApp);

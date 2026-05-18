const controlPanelTemplate = document.createElement("template");

controlPanelTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      height: 100px;
      min-height: 100px;
      max-height: 100px;
      box-sizing: border-box;
      border-top: 1px solid rgba(15, 23, 42, 0.12);
      background:
        linear-gradient(135deg, rgba(244, 247, 250, 0.96), rgba(230, 237, 243, 0.96));
      box-shadow: 0 -12px 30px rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(10px);
    }

    .panel {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 100%;
      padding: 16px 20px;
      box-sizing: border-box;
      overflow-x: auto;
    }

    button,
    input[type="color"] {
      flex: 0 0 auto;
      height: 48px;
      border-radius: 14px;
      border: 1px solid rgba(15, 23, 42, 0.12);
      box-sizing: border-box;
    }

    button {
      padding: 0 18px;
      background: #ffffff;
      color: #112031;
      font: 600 14px/1 "Segoe UI", sans-serif;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
      background: #f8fafc;
    }

    button:active {
      transform: translateY(0);
      box-shadow: 0 6px 14px rgba(15, 23, 42, 0.1);
    }

    input[type="color"] {
      width: 56px;
      padding: 4px;
      background: #ffffff;
      cursor: pointer;
    }
  </style>
  <div class="panel">
    <button type="button" data-action="add-polygon">Add polygon</button>
    <button type="button" data-action="delete-selected">Delete selected</button>
    <button type="button" data-action="delete-all">Delete all</button>
    <button type="button" data-action="undo">Undo</button>
    <button type="button" data-action="redo">Redo</button>
    <input type="color" value="#4f46e5" aria-label="Selected polygon color" />
    <button type="button" data-action="recolor-selected">Recolor selected</button>
  </div>
`;

export class PolygonControlPanel extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(controlPanelTemplate.content.cloneNode(true));
  }
}

customElements.define("polygon-control-panel", PolygonControlPanel);

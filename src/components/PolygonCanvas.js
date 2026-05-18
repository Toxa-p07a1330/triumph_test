const canvasTemplate = document.createElement("template");

canvasTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .canvas-shell {
      position: relative;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(15, 23, 42, 0.15);
      border-radius: 24px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(240, 244, 248, 0.95));
      box-shadow:
        0 18px 40px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
  </style>
  <div class="canvas-shell">
    <canvas part="canvas"></canvas>
  </div>
`;

export class PolygonCanvas extends HTMLElement {
  #canvas;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(canvasTemplate.content.cloneNode(true));
    this.#canvas = shadowRoot.querySelector("canvas");
  }

  get canvasElement() {
    return this.#canvas;
  }
}

customElements.define("polygon-canvas", PolygonCanvas);

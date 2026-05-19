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

    .info-panel {
      display: grid;
      grid-template-columns: repeat(2, minmax(120px, auto));
      gap: 8px 24px;
      margin-left: auto;
      padding-left: 12px;
      white-space: nowrap;
    }

    .info-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .info-title {
      color: rgba(17, 32, 49, 0.7);
      font: 600 12px/1.2 "Segoe UI", sans-serif;
    }

    .info-value {
      color: #112031;
      font: 700 16px/1.2 "Segoe UI", sans-serif;
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

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      box-shadow: none;
      transform: none;
      background: #eef2f6;
    }

    input[type="color"] {
      width: 56px;
      padding: 4px;
      background: #ffffff;
      cursor: pointer;
    }
  </style>
  <div class="panel">
    <button type="button" data-action="add-polygon">Сгенерировать полигон</button>
    <button type="button" data-action="import-json">Импорт</button>
    <button type="button" data-action="export-json">Экспорт</button>
    <button type="button" data-action="delete-selected">Удалить выбранный</button>
    <button type="button" data-action="delete-all">Удалить все</button>
    <button type="button" data-action="undo" title="Горячая клавиша: Ctrl+Z">Отменить</button>
    <button type="button" data-action="redo" title="Горячая клавиша: Ctrl+Y">Повторить</button>
    <input type="color" value="#4f46e5" aria-label="Цвет выбранного полигона" />
    <button type="button" data-action="recolor-selected">Перекрасить выбранный</button>
    <div class="info-panel">
      <div class="info-block">
        <div class="info-title">Количество полигонов</div>
        <div class="info-value" data-role="polygons-count">0</div>
      </div>
      <div class="info-block">
        <div class="info-title">Имя выбранного полигона</div>
        <div class="info-value" data-role="selected-polygon-name">Ничего не выбрано</div>
      </div>
    </div>
  </div>
`;

export class PolygonControlPanel extends HTMLElement {
  #addPolygonButton;
  #importJsonButton;
  #exportJsonButton;
  #deleteSelectedButton;
  #deleteAllButton;
  #undoButton;
  #redoButton;
  #colorInput;
  #recolorSelectedButton;
  #polygonsCountValue;
  #selectedPolygonNameValue;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(controlPanelTemplate.content.cloneNode(true));
    this.#addPolygonButton = shadowRoot.querySelector('[data-action="add-polygon"]');
    this.#importJsonButton = shadowRoot.querySelector('[data-action="import-json"]');
    this.#exportJsonButton = shadowRoot.querySelector('[data-action="export-json"]');
    this.#deleteSelectedButton = shadowRoot.querySelector('[data-action="delete-selected"]');
    this.#deleteAllButton = shadowRoot.querySelector('[data-action="delete-all"]');
    this.#undoButton = shadowRoot.querySelector('[data-action="undo"]');
    this.#redoButton = shadowRoot.querySelector('[data-action="redo"]');
    this.#colorInput = shadowRoot.querySelector('input[type="color"]');
    this.#recolorSelectedButton = shadowRoot.querySelector('[data-action="recolor-selected"]');
    this.#polygonsCountValue = shadowRoot.querySelector('[data-role="polygons-count"]');
    this.#selectedPolygonNameValue = shadowRoot.querySelector('[data-role="selected-polygon-name"]');
  }

  get addPolygonButton() {
    return this.#addPolygonButton;
  }

  get importJsonButton() {
    return this.#importJsonButton;
  }

  get exportJsonButton() {
    return this.#exportJsonButton;
  }

  get deleteSelectedButton() {
    return this.#deleteSelectedButton;
  }

  get deleteAllButton() {
    return this.#deleteAllButton;
  }

  get undoButton() {
    return this.#undoButton;
  }

  get redoButton() {
    return this.#redoButton;
  }

  get colorInput() {
    return this.#colorInput;
  }

  get recolorSelectedButton() {
    return this.#recolorSelectedButton;
  }

  set polygonsCount(value) {
    this.#polygonsCountValue.textContent = String(value);
  }

  set selectedPolygonName(value) {
    this.#selectedPolygonNameValue.textContent = value;
  }

  set undoDisabled(value) {
    this.#undoButton.disabled = Boolean(value);
  }

  set redoDisabled(value) {
    this.#redoButton.disabled = Boolean(value);
  }
}

customElements.define("polygon-control-panel", PolygonControlPanel);

export class HistoryRecord {
  static ACTION_TYPES = Object.freeze({
    CREATE: "create",
    DELETE: "delete",
    RECOLORED: "recolored",
    MOVED: "moved",
  });

  #actionType;
  #polygonId;
  #oldProperties;
  #newProperties;

  constructor(actionType, polygonId, oldProperties = null, newProperties = null) {
    this.actionType = actionType;
    this.polygonId = polygonId;
    this.oldProperties = oldProperties;
    this.newProperties = newProperties;
  }

  get actionType() {
    return this.#actionType;
  }

  set actionType(value) {
    const actionTypes = Object.values(HistoryRecord.ACTION_TYPES);

    if (!actionTypes.includes(value)) {
      throw new TypeError(`HistoryRecord action type must be one of: ${actionTypes.join(", ")}.`);
    }

    this.#actionType = value;
  }

  get polygonId() {
    return this.#polygonId;
  }

  set polygonId(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new TypeError("HistoryRecord polygonId must be a positive integer.");
    }

    this.#polygonId = value;
  }

  get oldProperties() {
    return HistoryRecord.#cloneProperties(this.#oldProperties);
  }

  set oldProperties(value) {
    this.#oldProperties = HistoryRecord.#validateProperties(value, "oldProperties");
  }

  get newProperties() {
    return HistoryRecord.#cloneProperties(this.#newProperties);
  }

  set newProperties(value) {
    this.#newProperties = HistoryRecord.#validateProperties(value, "newProperties");
  }

  static #validateProperties(value, propertyName) {
    if (value === null) {
      return null;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`HistoryRecord ${propertyName} must be an object or null.`);
    }

    return HistoryRecord.#cloneProperties(value);
  }

  static #cloneProperties(value) {
    if (value === null) {
      return null;
    }

    return structuredClone(value);
  }
}

import { HistoryRecord } from "./HistoryRecord.js";

export class HistoryStack {
  #records = [];

  constructor(records = []) {
    this.records = records;
  }

  get records() {
    return [...this.#records];
  }

  set records(records) {
    if (!Array.isArray(records)) {
      throw new TypeError("HistoryStack records must be an array of HistoryRecord instances.");
    }

    if (!records.every((record) => record instanceof HistoryRecord)) {
      throw new TypeError("HistoryStack records must contain only HistoryRecord instances.");
    }

    this.#records = [...records];
  }

  get size() {
    return this.#records.length;
  }

  push(record) {
    if (!(record instanceof HistoryRecord)) {
      throw new TypeError("HistoryStack can push only HistoryRecord instances.");
    }

    this.#records.push(record);
  }

  pop() {
    return this.#records.pop() ?? null;
  }

  peek() {
    return this.#records.at(-1) ?? null;
  }

  clear() {
    this.#records = [];
  }

  isEmpty() {
    return this.#records.length === 0;
  }
}

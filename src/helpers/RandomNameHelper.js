export class RandomNameHelper {
  static #vowels = ["a", "e", "i", "o", "u", "y"];
  static #consonants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "v",
    "w",
    "z",
  ];

  static generate(existingNames = new Set()) {
    if (!(existingNames instanceof Set)) {
      throw new TypeError("RandomNameHelper generate requires a Set of existing names.");
    }

    let attempt = 0;

    while (attempt < 5000) {
      const candidateName = RandomNameHelper.#buildName();

      if (!existingNames.has(candidateName)) {
        return candidateName;
      }

      attempt += 1;
    }

    throw new Error("Unable to generate a unique polygon name.");
  }

  static #buildName() {
    const syllablesAmount = RandomNameHelper.#getRandomInt(2, 4);
    let result = "";

    for (let syllableIndex = 0; syllableIndex < syllablesAmount; syllableIndex += 1) {
      result += RandomNameHelper.#pick(RandomNameHelper.#consonants);
      result += RandomNameHelper.#pick(RandomNameHelper.#vowels);
    }

    return `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
  }

  static #pick(values) {
    return values[RandomNameHelper.#getRandomInt(0, values.length - 1)];
  }

  static #getRandomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }
}

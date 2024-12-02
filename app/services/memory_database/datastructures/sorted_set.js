import SkipList from "../../../../lib/skip_list.js";

// Sorted set of key value pairs where keys are numeric scores
export default class SortedSet {
  constructor(skipList = new SkipList(), map = new Map()) {
    this.skipList = skipList;
    this.map = map;
  }

  // Stores a key value pair
  set(score, val) {
    if (score.constructor.name != "Number") {
      throw new Error(`Score ${score} is not numeric`);
    }

    this.skipList.insert(score);
    this.map.set(score, val);

    return this;
  }

  // Returns associated value for this key
  get(score) {
    return this.map.get(score) || null;
  }

  // Returns an array of score value pairs within the specified score range
  getByRange(minscore, maxscore) {
    const scores = this.skipList.getByRange(minscore, maxscore);
    return scores.map((score) => [score, this.map.get(score)]);
  }

  // Returns true if a value was deleted false otherwise
  delete(score) {
    const wasDeleted = this.map.delete(score);
    if (!wasDeleted) {
      return false;
    }
    return this.skipList.delete(score);
  }

  // Returns an array of score value pairs that were deleted
  deleteByRange(minscore, maxscore) {
    const deletedScores = this.skipList.deleteByRange(minscore, maxscore);
    const scoreValues = [];
    deletedScores.forEach((score) => {
      scoreValues.push([score, this.map.get(score)]);

      this.map.delete(score);
    });

    return scoreValues;
  }
}

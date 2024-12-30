import Command from "../../../../lib/command/command.js";
import MultiCommand from "../../../../lib/command/multi_command.js";
import SkipList from "../../../../lib/skip_list.js";
import Base from "./base.js";

// Sorted set of key value pairs where the key acts as a score to sort by
export default class SortedSet extends Base {
  constructor(skipList = new SkipList(), map = new Map()) {
    super();
    this.skipList = skipList;
    this.map = map;
  }

  // Stores a key value pair
  set(score, val) {
    if (score.constructor.name != "String") {
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

  undoCommand(operation, ...args) {
    if (operation == "set") {
      return new Command(this, "delete", args[0]);
    } else if (operation == "get" || operation == "getByRange") {
      return Command.noop();
    } else if (operation == "delete") {
      const deletedValue = this.get(args[0]);

      return new Command(this, "set", args[0], deletedValue);
    } else if (operation == "deleteByRange") {
      const deletedValues = this.getByRange(args[0], args[1]);

      const commands = [];
      for (const deletedValue of deletedValues) {
        commands.push(
          new Command(this, "set", deletedValue[0], deletedValue[1])
        );
      }

      return new MultiCommand(commands);
    } else {
      throw new Error(`Unrecognized operation ${operation} for SortedSet`);
    }
  }
}

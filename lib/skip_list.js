class Node {
  constructor(score, down = null, next = null, prev = null) {
    this.score = score;
    this.down = down;
    this.next = next;
    this.prev = prev;
    Object.defineProperties(this, {
      isHead: {
        value: false,
        writable: false,
        configurable: false,
      },
    });
  }
}

// A special case of a node. It always points to the first node in each linked
// list.
class Head {
  constructor(down = null, next = null) {
    // Score and previous are fixed to -inf and null respectively
    Object.defineProperties(this, {
      isHead: {
        value: true,
        writable: false,
        configurable: false,
      },
      score: {
        value: -Infinity,
        writable: false,
        configurable: false,
      },
      prev: {
        value: null,
        writable: false,
        configurable: false,
      },
    });

    this.down = down;
    this.next = next;
    this.width = next == null ? 0 : 1;
  }
}

// Implementation of a sorted set. Only numeric scores are allowed
export default class SkipList {
  constructor(p = 0.5) {
    // Stores the array of level heads. Level 0 is the level with all the nodes.
    this.levels = [new Head()];
    this.p = p;
  }

  // Insertion happens from the top most level down to the bottom most.
  insert(score) {
    if (score == null || score == -Infinity || score == Infinity) {
      throw new Error("Cannot insert null / infinite scores into SkipList");
    }
    if (score.constructor.name != "Number") {
      throw new Error("Score is of invalid type");
    }

    // Track nodes that need updating which is at most 1 node per level
    let update = new Array(this.numLevels());

    // Starting from the top and find the largest node smaller than score and
    // add them to the update array
    let currentLevel = this.numLevels() - 1;
    let cur = this.levels[currentLevel];
    while (currentLevel > -1) {
      while (cur.next != null && cur.next.score <= score) {
        cur = cur.next;
      }

      // Throw an error if we find a node with the same score as input
      if (cur.score == score) {
        throw new Error("Duplicate node found with the same score");
      }

      update[currentLevel] = cur;
      cur = cur.down;
      currentLevel -= 1;
    }

    // Calculate the highest level this node should appear in
    const topLevel = this.#insertLevel();

    // Insert the node from level 0 to topLevel
    let level = 0;
    let downNode = null;
    while (level <= topLevel) {
      // Create the node to be inserted at level
      let node = new Node(score, downNode);

      // Handle the case where we are creating a new level
      if (level == this.numLevels()) {
        // Push a new head that points to the level below and the new node
        this.levels.push(new Head(this.levels[level - 1], node));
        node.prev = this.levels[level];
        // Set the size of the level
        this.levels[level].width = 1;
      } else {
        // Handle the case where we are inserting at an existing level
        node.next = update[level].next;
        node.prev = update[level];
        update[level].next = node;
        if (node.next != null) {
          node.next.prev = node;
        }
        // Increment the size of the level
        this.levels[level].width += 1;
      }

      // Go to the next level up and set that node's down node the this node
      level += 1;
      downNode = node;
    }

    return this;
  }

  // Returns whether a node exits with this score
  get(score) {
    return this.getByRange(score, score).length != 0;
  }

  // Returns all the scores between two ranges inclusive.
  getByRange(minScore, maxScore) {
    if (minScore > maxScore) {
      throw new Error(
        "MinScore must be lower than MaxScore when deleting by range"
      );
    }

    // Starting from the top level go down to the bottom most level pointing
    // to the first node with score less than minScore
    let curNode = this.levels[this.numLevels() - 1];
    for (let curLevel = this.numLevels() - 1; curLevel > 0; curLevel--) {
      while (curNode.next != null && curNode.next.score < minScore) {
        curNode = curNode.next;
      }

      curNode = curNode.down;
    }

    const found = [];
    while (curNode != null && curNode.score <= maxScore) {
      if (minScore <= curNode.score && curNode.isHead == false) {
        found.push(curNode.score);
      }
      curNode = curNode.next;
    }

    return found;
  }

  // For new nodes the maximum level it will appear in, 0 indexed.
  #insertLevel() {
    let level = 0;
    while (level < this.numLevels() && Math.random() < this.p) {
      level += 1;
    }

    return level;
  }

  delete(score) {
    return this.deleteByRange(score, score).length != 0;
  }

  // Deletes values in the SkipList that fall between the range inclusively.
  deleteByRange(minScore, maxScore) {
    if (minScore > maxScore) {
      throw new Error(
        "MinScore must be lower than MaxScore when deleting by range"
      );
    }
    // For each level stores the first node that needs to be updated. May be
    // a head node.
    const update = new Array(this.numLevels());

    // Start from the top most level and populate update array
    for (let curLevel = this.numLevels() - 1; curLevel > -1; curLevel--) {
      let curNode = this.levels[curLevel];

      // Find the node that is closest to minScore but still lower than it
      while (curNode.next != null && curNode.next.score < minScore) {
        curNode = curNode.next;
      }

      // Node in front of update will need to be deleted
      update[curLevel] = curNode;
      curNode = curNode.down;
    }

    // Delete nodes at each level in the update array
    let deleted = [];
    update.forEach((startNode, level) => {
      // Track the number of nodes that are being deleted
      let numDeleted = 0;
      // Nodes in update are always outside of deletion range. Use next to
      // get to the first candidate for deletion.
      let currentNode = startNode.next;
      while (currentNode != null && currentNode.score <= maxScore) {
        numDeleted++;

        // If this is the lowest level track the scores deleted
        if (level == 0) {
          deleted.push(currentNode.score);
        }

        currentNode = currentNode.next;
      }

      // Update startNode to point to the first node larger than maxScore
      startNode.next = currentNode;
      if (currentNode != null) {
        currentNode.prev = startNode;
      }

      // Decrement width of the level by the number of nodes deleted
      this.levels[level].width -= numDeleted;
    });

    // Collapse any empty levels caused by deletion other than the bottom most
    for (let curLevel = this.numLevels() - 1; curLevel > 0; curLevel--) {
      if (this.levels[curLevel].width == 0) {
        this.levels.pop();
      }
    }

    return deleted;
  }

  numLevels() {
    return this.levels.length;
  }

  maxWidth() {
    return this.levels[0].width;
  }

  print() {
    // Maps column to score
    let columnMap = new Map();
    let cur = this.levels[0].next;
    let idx = 0;
    while (cur != null) {
      columnMap.set(idx, cur.score);
      idx++;
      cur = cur.next;
    }

    // Map score to the highest level or row it belongs to
    let rowMap = new Map();
    for (let level = this.numLevels() - 1; level > -1; level--) {
      let cur = this.levels[level].next;
      while (cur != null) {
        if (!rowMap.has(cur.score)) {
          rowMap.set(cur.score, level);
        }

        cur = cur.next;
      }
    }

    // Print the skip list
    for (let i = this.numLevels() - 1; i > -1; i--) {
      let line = [];
      for (let j = 0; j < this.maxWidth(); j++) {
        // Check if a node lives here
        if (columnMap.has(j) && rowMap.get(columnMap.get(j)) >= i) {
          line.push(columnMap.get(j));
        } else {
          line.push("X");
        }
      }
      console.log(line.join("-"));
    }
  }
}

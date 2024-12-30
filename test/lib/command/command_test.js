import Command from "../../../lib/command/command.js";
import DoublyLinkedList from "../../../lib/doubly_linked_list.js";

describe("Command", () => {
  it("executes", () => {
    const dll = new DoublyLinkedList();

    const command = new Command(dll, "insertTail", 3);

    assert.strictEqual(dll.peekTail(), undefined);

    command.execute();

    assert.strictEqual(dll.peekTail(), 3);

    const noop = Command.noop();

    noop.execute();

    assert.strictEqual(dll.peekTail(), 3);
  });
});

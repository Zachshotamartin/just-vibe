A **linked list** stores a sequence as a chain of **nodes**. Each node holds a value and a reference to the next node.

Since you know arrays, the key difference is how you reach an item: an array lets you jump to an index; a linked list makes you follow links from the beginning.

```text
head → [A] → [B] → [C] → None
```

**Head** refers to the first node. `None` means the chain ends. To find C, you visit A, then B, then C.

Let’s build that chain and insert X after B. I’ll use a small Python class; each `Node(...)` creates an object with two attributes:

```python
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

head = Node("A", Node("B", Node("C")))

b = head.next             # Follow A's link to B
x = Node("X")

x.next = b.next            # X now points to C
b.next = x                 # B now points to X

current = head
while current is not None:
    print(current.value)
    current = current.next
```

This prints A, B, X, C, each on its own line.

The insertion happens in two steps:

1. `x.next = b.next` gives X a reference to C. The original chain still runs A → B → C.
2. `b.next = x` redirects B’s link. The chain becomes A → B → X → C.

No existing values shift around, as they would when inserting into the middle of an array.

**The assignment order matters here.** If you change `b.next` first, the following `x.next = b.next` makes X point to itself. You also lose access to C through the chain. Saving the old successor first prevents this.

A common misconception is that linked-list insertion is always fast. Inserting after an **already-known node** takes **O(1)** time: a fixed number of link changes. Finding that node first can take **O(n)** time: you may visit all *n* nodes.

A few details complete the picture:

- **At the front:** insert by pointing the new node to the old head, then updating `head`. Delete the first node by setting `head = head.next`.
- **Empty list:** `head` is `None`. Removing the only node also leaves `head` as `None`; never access `.next` on `None`.
- **Tail reference:** remembering the last node lets you append without walking the whole chain. You must update it when the last node changes.
- **Singly versus doubly linked:** this example is singly linked—each node knows only its next node. A doubly linked list also stores a previous link, useful for moving backward and forward through something like a history sequence.

Compared with Python’s built-in `list`, linked lists use extra memory for links and often have worse practical performance because nodes are separate objects. Python lists provide fast indexing and usually cheap appends, though occasional resizing takes more work.

Optional check: after inserting X, what single assignment to `b.next` would remove X from the chain while keeping C reachable?

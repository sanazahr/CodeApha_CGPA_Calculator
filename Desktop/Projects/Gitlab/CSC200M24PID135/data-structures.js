// Custom Data Structures Implementation

// Custom Array implementation
class CustomArray {
    constructor() {
        this.items = {};
        this.length = 0;
    }

    push(element) {
        this.items[this.length] = element;
        this.length++;
        return this.length;
    }

    pop() {
        if (this.length === 0) return undefined;
        const lastElement = this.items[this.length - 1];
        delete this.items[this.length - 1];
        this.length--;
        return lastElement;
    }

    get(index) {
        if (index < 0 || index >= this.length) return undefined;
        return this.items[index];
    }

    set(index, value) {
        if (index < 0 || index >= this.length) return false;
        this.items[index] = value;
        return true;
    }

    forEach(callback) {
        for (let i = 0; i < this.length; i++) {
            callback(this.items[i], i, this);
        }
    }

    slice(start = 0, end = this.length) {
        const result = new CustomArray();
        for (let i = start; i < end && i < this.length; i++) {
            result.push(this.items[i]);
        }
        return result;
    }

    splice(start, deleteCount = this.length - start, ...items) {
        const deletedItems = new CustomArray();
        
        // Remove items to delete
        for (let i = 0; i < deleteCount; i++) {
            if (start + i < this.length) {
                deletedItems.push(this.items[start + i]);
            }
        }
        
        // Shift items after deletion point
        const newLength = this.length - deleteCount + items.length;
        for (let i = newLength - 1; i >= start + items.length; i--) {
            this.items[i] = this.items[i - items.length + deleteCount];
        }
        
        // Insert new items
        for (let i = 0; i < items.length; i++) {
            this.items[start + i] = items[i];
        }
        
        // Update length
        this.length = newLength;
        
        // Clean up extra properties
        for (let i = this.length; i < this.length + deleteCount; i++) {
            delete this.items[i];
        }
        
        return deletedItems;
    }

    indexOf(element) {
        for (let i = 0; i < this.length; i++) {
            if (this.items[i] === element) return i;
        }
        return -1;
    }

    includes(element) {
        return this.indexOf(element) !== -1;
    }

    every(callback) {
        for (let i = 0; i < this.length; i++) {
            if (!callback(this.items[i], i, this)) return false;
        }
        return true;
    }

    some(callback) {
        for (let i = 0; i < this.length; i++) {
            if (callback(this.items[i], i, this)) return true;
        }
        return false;
    }

    isEmpty() {
        return this.length === 0;
    }

    size() {
        return this.length;
    }

    clear() {
        this.items = {};
        this.length = 0;
    }
}

// Custom Stack implementation
class CustomStack {
    constructor() {
        this.items = new CustomArray();
    }

    push(element) {
        this.items.push(element);
    }

    pop() {
        return this.items.pop();
    }

    peek() {
        return this.items.get(this.items.length - 1);
    }

    isEmpty() {
        return this.items.isEmpty();
    }

    size() {
        return this.items.size();
    }

    clear() {
        this.items.clear();
    }

    forEach(callback) {
        this.items.forEach(callback);
    }
}

// Custom Queue implementation
class CustomQueue {
    constructor() {
        this.items = new CustomArray();
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        return this.items.splice(0, 1).get(0);
    }

    front() {
        return this.items.get(0);
    }

    isEmpty() {
        return this.items.isEmpty();
    }

    size() {
        return this.items.size();
    }

    clear() {
        this.items.clear();
    }

    forEach(callback) {
        this.items.forEach(callback);
    }
}

// Custom Linked List implementation
class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class CustomLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const newNode = new ListNode(value);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        
        this.length++;
        return this;
    }

    prepend(value) {
        const newNode = new ListNode(value);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }
        
        this.length++;
        return this;
    }

    get(index) {
        if (index < 0 || index >= this.length) return null;
        
        let currentNode = this.head;
        let currentIndex = 0;
        
        while (currentIndex < index) {
            currentNode = currentNode.next;
            currentIndex++;
        }
        
        return currentNode.value;
    }

    remove(index) {
        if (index < 0 || index >= this.length) return null;
        
        if (index === 0) {
            const removedValue = this.head.value;
            this.head = this.head.next;
            if (!this.head) this.tail = null;
            this.length--;
            return removedValue;
        }
        
        let prevNode = null;
        let currentNode = this.head;
        let currentIndex = 0;
        
        while (currentIndex < index) {
            prevNode = currentNode;
            currentNode = currentNode.next;
            currentIndex++;
        }
        
        prevNode.next = currentNode.next;
        
        if (index === this.length - 1) {
            this.tail = prevNode;
        }
        
        this.length--;
        return currentNode.value;
    }

    forEach(callback) {
        let currentNode = this.head;
        let index = 0;
        
        while (currentNode) {
            callback(currentNode.value, index, this);
            currentNode = currentNode.next;
            index++;
        }
    }

    toArray() {
        const result = new CustomArray();
        let currentNode = this.head;
        
        while (currentNode) {
            result.push(currentNode.value);
            currentNode = currentNode.next;
        }
        
        return result;
    }

    slice(start = 0, end = this.length) {
        const result = new CustomLinkedList();
        let currentNode = this.head;
        let currentIndex = 0;
        
        while (currentNode && currentIndex < end) {
            if (currentIndex >= start) {
                result.append(currentNode.value);
            }
            currentNode = currentNode.next;
            currentIndex++;
        }
        
        return result;
    }

    isEmpty() {
        return this.length === 0;
    }

    size() {
        return this.length;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
}
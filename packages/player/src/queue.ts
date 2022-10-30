
export class Queue<T> {
    items: T[]
    constructor(...items: T[]) {
        this.items = [...items]
    }
    enqueue(item: T) {
        this.items.push(item)
    }
    dequeue() {
        return this.items.shift()
    }
    last() {
        return this.items[this.items.length - 1]
    }
    first() {
        return this.items[0]
    }
    clear() {
        this.items = []
    }
    get length() {
        return this.items.length
    }

    [Symbol.iterator]() {
        return this.next()
    }

    *next() {
        for (const item of this.items) {
            yield item
        }
    }
}

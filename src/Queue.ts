export class Queue <T> {
    items: T[];
    // Retrieved from : https://www.geeksforgeeks.org/implementation-queue-javascript/
    // Array is used to implement a Queue
    constructor() {
        this.items = [];
    }

    enqueue(element: T) {
        // adding element to the queue
        this.items.push(element);
    }

    dequeue() {
        // removing element from the queue
        // returns underflow when called
        // on empty queue
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    isEmpty() {
        // return true if the queue is empty.
        return this.items.length == 0;
    }

    numberOfItems() {
        return this.items.length;
    }
}

export class QueueJob {
    url: string;
    domain:string;
    depth:number;
    parent?: string;
    constructor(url: string,domain: string,depth: number,parent?: string){
        this.url = `${url}`;
        this.domain = `${domain}`;
        this.depth = depth
        if(parent != undefined){
            this.parent = `${parent}`
        }
    }
}
module.exports.Queue = Queue;
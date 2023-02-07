"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueJob = exports.Queue = void 0;
var Queue = /** @class */ (function () {
    // Retrieved from : https://www.geeksforgeeks.org/implementation-queue-javascript/
    // Array is used to implement a Queue
    function Queue() {
        this.items = [];
    }
    Queue.prototype.enqueue = function (element) {
        // adding element to the queue
        this.items.push(element);
    };
    Queue.prototype.dequeue = function () {
        // removing element from the queue
        // returns underflow when called
        // on empty queue
        if (this.isEmpty())
            return null;
        return this.items.shift();
    };
    Queue.prototype.isEmpty = function () {
        // return true if the queue is empty.
        return this.items.length == 0;
    };
    Queue.prototype.numberOfItems = function () {
        return this.items.length;
    };
    return Queue;
}());
exports.Queue = Queue;
var QueueJob = /** @class */ (function () {
    function QueueJob(url, domain, depth, parent) {
        this.url = "" + url;
        this.domain = "" + domain;
        this.depth = depth;
        if (parent != undefined) {
            this.parent = "" + parent;
        }
    }
    return QueueJob;
}());
exports.QueueJob = QueueJob;
module.exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEventTopic = exports.TransactionEvent = void 0;
const primitives_1 = require("./primitives");
class TransactionEvent {
    constructor(init) {
        this.address = new primitives_1.Address("");
        this.identifier = "";
        this.topics = [];
        this.data = "";
        Object.assign(this, init);
    }
    static fromHttpResponse(responsePart) {
        let result = new TransactionEvent();
        result.address = new primitives_1.Address(responsePart.address);
        result.identifier = responsePart.identifier || "";
        result.topics = (responsePart.topics || []).map(topic => new TransactionEventTopic(topic));
        result.data = Buffer.from(responsePart.data || "", "base64").toString();
        return result;
    }
    findFirstOrNoneTopic(predicate) {
        return this.topics.filter(topic => predicate(topic))[0];
    }
    getLastTopic() {
        return this.topics[this.topics.length - 1];
    }
}
exports.TransactionEvent = TransactionEvent;
class TransactionEventTopic {
    constructor(topic) {
        this.raw = Buffer.from(topic || "", "base64");
    }
    toString() {
        return this.raw.toString("utf8");
    }
    hex() {
        return this.raw.toString("hex");
    }
    valueOf() {
        return this.raw;
    }
}
exports.TransactionEventTopic = TransactionEventTopic;
//# sourceMappingURL=transactionEvents.js.map
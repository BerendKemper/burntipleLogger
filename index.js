"use strict";
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const instance = new WeakMap();
const logger = {};
class Logger {
    /**Creates logger[type]
     * @param {String} type
     * @param {Object} options 
     * @param {String} options.dir
     * @param {String} options.name
     * @param {Function} options.formatter
     * @param {Array} options.extend
     * @returns logger[type].log*/
    constructor(type, options = {}) {
        return new Promise((resolve, reject) => {
            let { dir = "loggers", name = "monkey", formatter = (data, callback) => callback(data.join(" ")), extend = [] } = options;
            this.dirpath = path.join(dir, type);
            fs.mkdir(this.dirpath, { recursive: true }, err => {
                const extended = extend.map(loggerType => {
                    const _this = instance.get(loggerType);
                    if (_this instanceof Logger) return _this;
                    else throw new TypeError("extend may only have Loggers");
                });
                let filepath = path.join(this.dirpath, name + ".log");
                let writable = this.writable = fs.createWriteStream(filepath, { flags: "a+" });
                const chain = writable.chain = [new Promise(resolve => writable.once("open", () => resolve()))];
                const log = (...data) => formatter(data, formatted => {
                    const logBuffer = Buffer.from(formatted + "\n", "utf8");
                    chain.push(new Promise(resolve => chain[chain.length - 1].then(() =>
                        chain.shift(writable.write(logBuffer, () => resolve())))));
                    for (const x of extended) {
                        const xChain = x.writable.chain;
                        xChain.push(new Promise(resolve => xChain[xChain.length - 1].then(() =>
                            xChain.shift(x.writable.write(logBuffer, () => resolve())))));
                    }
                });
                if (instance.get(logger[type]) instanceof Logger)
                    reject(Error(type + " Logger already exists"));
                else {
                    instance.set(log, this);
                    logger[type] = log;
                }
                log.filepath = filepath;
                this.event = {
                    ready(callback) {
                        chain[chain.length - 1].then(() => callback());
                    }
                };
                log.once = (event, callback) => {
                    if (typeof callback !== "function")
                        throw new TypeError("listener must be a function");
                    this.event[event](callback);
                };
                log.setName = name => {
                    filepath = path.join(this.dirpath, name + ".log");
                    const newWritable = fs.createWriteStream(filepath, { flags: "a+" });
                    chain.push(new Promise(resolve => {
                        const newOpened = new Promise(resolve => newWritable.once("open", () => resolve()));
                        chain[chain.length - 1].then(() => chain.shift(newOpened.then(() =>
                            resolve(writable = this.writable = newWritable, writable.chain = chain, log.filepath = filepath)
                        )));
                    }));
                };
                resolve(log);
            });
        });
    }
};
module.exports = Object.freeze({ Logger, logger });
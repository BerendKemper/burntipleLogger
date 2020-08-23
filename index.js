"use strict";
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
                if (instance.get(logger[type]) instanceof Logger)
                    reject(Error(type + " Logger already exists"));
                const log = this.log = (...data) => formatter(data, this.logString);
                this.extended = extend.map(loggerType => {
                    const _this = instance.get(loggerType);
                    if (_this instanceof Logger) return _this;
                    else throw new TypeError("extend may only have Loggers");
                });
                this.filepath = log.filepath = path.join(this.dirpath, name + ".log");
                this.writable = fs.createWriteStream(this.filepath, { flags: "a+" });
                this.chain = [new Promise(resolve => this.writable.once("open", () => resolve()))];
                log.once = this.once;
                log.setName = this.setName;
                instance.set(log, this);
                logger[type] = log;
                resolve();
            });
        });
    }
    logString = logString => {
        const logBuffer = Buffer.from(logString + "\n", "utf8");
        const chain = this.chain;
        chain.push(new Promise(resolve => chain[chain.length - 1].then(() =>
            chain.shift(this.writable.write(logBuffer, () => resolve())))));
        for (const x of this.extended) {
            const xChain = x.chain;
            xChain.push(new Promise(resolve => xChain[xChain.length - 1].then(() =>
                xChain.shift(x.writable.write(logBuffer, () => resolve())))));
        }
    }
    listeners = {
        ready: callback => this.chain[this.chain.length - 1].then(() => callback())
    }
    once = (event, callback) => {
        if (this.listeners[event]) {
            if (typeof callback !== "function")
                throw new TypeError("listener must be a function");
            this.listeners[event](callback);
        }
    }
    setName = name => {
        const newFilepath = path.join(this.dirpath, name + ".log");
        const newWritable = fs.createWriteStream(newFilepath, { flags: "a+" });
        const chain = this.chain;
        chain.push(new Promise(resolve => {
            const newOpened = new Promise(resolve => newWritable.once("open", () => resolve()));
            chain[chain.length - 1].then(() => chain.shift(newOpened.then(() =>
                resolve(this.writable = newWritable, this.log.filepath = newFilepath)
            )));
        }));
    }
};
module.exports = Object.freeze({ Logger, logger });
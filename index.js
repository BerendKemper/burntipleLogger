"use strict";
const path = require("path");
const fs = require("fs");
const instance = new WeakMap();
const logger = {};
class Logger {
    /**Creates logger[type]
     * @param {string} type
     * @param {Object} options 
     * @param {string} options.dir
     * @param {string} options.name
     * @param {Function} options.formatter 
     * @param {Array} options.extend */
    constructor(type, options = {}) {
        let { dir = "loggers", name = "monkey", autoRemoveEmpty, formatter = (data, callback) => callback(data.join(" ")), extend = [] } = options;
        this.dirpath = path.join(dir, type);
        return new Promise((resolve, reject) => {
            fs.mkdir(this.dirpath, { recursive: true }, err => {
                if (instance.get(logger[type]) instanceof Logger)
                    reject(Error(type + " Logger already exists"));
                const log = this.log = logger[type] = (...data) => formatter(data, this.logString);
                this.extended = extend.map(loggerType => {
                    const _this = instance.get(loggerType);
                    if (_this instanceof Logger) return _this;
                    else throw new TypeError("extend may only have Loggers");
                });
                this.autoRemoveEmpty = autoRemoveEmpty;
                log.filepath = path.join(this.dirpath, name + ".log");
                this.writable = fs.createWriteStream(log.filepath, { flags: "a+" });
                this.chain = [new Promise(resolve => this.writable.once("open", () => resolve()))];
                log.once = this.once;
                log.setName = this.setName;
                instance.set(log, this);
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
                throw new TypeError("callback must be a function");
            this.listeners[event](callback);
        }
    }
    setName = name => {
        const oldFilepath = this.log.filepath;
        const filepath = this.log.filepath = path.join(this.dirpath, name + ".log");
        const newWritable = fs.createWriteStream(filepath, { flags: "a+" });
        const chain = this.chain;
        chain.push(new Promise(resolve => {
            const newOpened = new Promise(resolve => newWritable.once("open", () => resolve()));
            chain[chain.length - 1].then(() => chain.shift(newOpened.then(() => {
                resolve(this.writable = newWritable);
                if (this.autoRemoveEmpty !== false) setTimeout(() => fs.readFile(oldFilepath, { flag: 'r' }, (err, data) => {
                    if (err === null && data.length === 0) fs.unlinkSync(oldFilepath);
                }), 333);
            })));
        }));
    }
};
module.exports = Object.freeze({ Logger, logger });
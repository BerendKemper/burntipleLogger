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
                const extendedWritables = extend.map(loggerType => instance.get(loggerType).writable);
                this.filepath = path.join(this.dirpath, name + ".log");
                let writable = this.writable = fs.createWriteStream(this.filepath, { flags: "a+" });
                let chain = writable.chain = [new Promise((resolve, reject) => resolve("first"))];
                const log = (...data) => formatter(data, formatted => {
                    const logBuffer = Buffer.from(formatted + "\n",);
                    chain.push(new Promise((resolve, reject) => chain[0].then(() => {
                        chain.shift(writable.write(logBuffer, () => resolve()));
                    })));
                    for (const xWritable of extendedWritables)
                        xWritable.chain.push(new Promise((resolve, reject) => xWritable.chain[0].then(() => {
                            xWritable.chain.shift(xWritable.write(logBuffer, () => resolve()));
                        })));
                });
                log.filepath = this.filepath;
                log.setName = name => {
                    log.filepath = this.filepath = path.join(this.dirpath, name + ".log");
                    writable = this.writable = fs.createWriteStream(this.filepath, { flags: "a+" });
                    chain = writable.chain = Array.from(chain);
                };
                if (instance.get(log) instanceof Logger === false) {
                    instance.set(log, this);
                    logger[type] = log;
                }
                else
                    reject(Error(type + " Logger already exists"));
                resolve(log);
            });
        });
    }
};
module.exports = Object.freeze({ Logger, logger });
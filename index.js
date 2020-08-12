"use strict";
const path = require("path");
const fs = require("fs");
const _logger = {};
const logger = {};
class Logger {
    constructor(type = "log", dir = "loggers", name = "monkey") {
        return new Promise((resolve, reject) => {
            this.dirpath = path.join(dir, type);
            fs.mkdir(this.dirpath, { recursive: true }, err => {
                this.filepath = path.join(this.dirpath, name + ".log");
                this.dirpath = path.join(dir, type);
                this.filepath = path.join(this.dirpath, name + ".log");
                this.stream = fs.createWriteStream(this.filepath, { flags: "a+" });
                const log = (logString) => this.stream.write(logString + "\n", "utf8");
                log.setName = name => {
                    this.filepath = path.join(this.dirpath, name + ".log");
                    this.stream = fs.createWriteStream(this.filepath, { flags: "a+" });
                };
                if (_logger[type] instanceof Logger === false) {
                    _logger[type] = this;
                    logger[type] = log;
                }
                else
                    reject(Error(type + " Logger already exists"));
                resolve(log);
            });
        });
    }
    static delete(type) {
        if (_logger[type] instanceof Logger === true)
            delete (_logger[type]);
        delete (logger[type]);
    }
};
module.exports = Object.freeze({ Logger, logger });
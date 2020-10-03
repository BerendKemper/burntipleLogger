"use strict";
const logger = {};
const fs = require("fs");
const path = require("path");
const instance = new WeakMap();
const onReady = Symbol("onReady");
const listeners = { 'ready': onReady };
const getInstance = logger => {
	let _this = instance.get(logger);
	if (_this) return _this;
	else throw new TypeError("extend may only have Loggers");
};
const extendLoggers = loggers => {
	const extending = new Array(loggers.length);
	for (let x = 0; x < extending.length; ++x)
		extending[x] = getInstance(loggers[x]);
	return extending;
};
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
				if (instance.get(logger[type]))
					reject(Error(type + " Logger already exists"));
				const log = this.log = logger[type] = (...data) => formatter(data, logString => this.logString(logString));
				this.extended = extend.length === 0 ? extend : extend.length === 1 ? [getInstance(extend[0])] : extendLoggers(extend);
				this.autoRemoveEmpty = autoRemoveEmpty;
				log.filepath = path.join(this.dirpath, name + ".log");
				this.writable = fs.createWriteStream(log.filepath, { flags: "a+" });
				this.chain = [new Promise(resolve => this.writable.once("open", () => resolve()))];
				log.once = (event, callback) => this.once(event, callback);
				log.setName = (name) => this.setName(name);
				instance.set(log, this);
				resolve();
			});
		});
	}
	logString(logString) {
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
	[onReady](callback) {
		this.chain[this.chain.length - 1].then(() => callback());
	}
	once(event, callback) {
		if (this[listeners[event]]) {
			if (typeof callback !== "function")
				throw new TypeError("callback must be a function");
			this[listeners[event]](callback);
		}
	}
	setName(name) {
		const oldFilepath = this.log.filepath;
		const filepath = this.log.filepath = path.join(this.dirpath, name + ".log");
		const newWritable = fs.createWriteStream(filepath, { flags: "a+" });
		const chain = this.chain;
		chain.push(new Promise(resolve => {
			const newOpened = new Promise(resolve => newWritable.once("open", () => resolve()));
			chain[chain.length - 1].then(() => chain.shift(newOpened.then(() => {
				this.writable.end(() => {
					resolve(this.writable = newWritable);
					if (this.autoRemoveEmpty !== false) setTimeout(() => fs.readFile(oldFilepath, { flag: 'r' }, (err, data) => {
						if (err === null && data.length === 0) fs.unlinkSync(oldFilepath);
					}), 1000);
				});
			})));
		}));
	}
};
Object.freeze(Logger.prototype);
module.exports = Object.freeze({ Logger, logger });
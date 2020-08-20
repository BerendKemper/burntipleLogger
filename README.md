# monkey-logger
A logger that creates a log-dir and can change the logger filename, allows formatter and extending.
<pre><code>npm i monkey-logger // WARNING not published yet

const { Logger, logger } = require("monkey-logger");</code></pre>
<h3>Table of Contents</h3>
<ul>
    <li><a href="https://github.com/BerendKemper/monkey-logger#class-logger">Class Logger</a></li>
    <ul>
        <li><a href="https://github.com/BerendKemper/monkey-logger#new-loggertypeoptions">new Logger(type[,options])</a></li>
    </ul>
    <li><a href="https://github.com/BerendKemper/monkey-logger#loggertype">logger[type]</a></li>
    <li><a href="https://github.com/BerendKemper/monkey-logger#example">Example</a></li>
</ul>
<h2>Class Logger</h2>
<h3>new Logger(type[,options])</h3>
<ul>
    <li><code>type</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a></li>
    <li><code>options</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;Object&gt;</a></li>
    <ul>
        <li><code>dir</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <code>loggers</code></li>
        <li><code>name</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <code>monkey</code></li>
        <li><code>formatter</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a> Default: <code>(data, callback) => callback(data.join(" "))</code></li>
        <ul>
            <li><code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array">&lt;Array&gt;</a></li>
            <li><code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a> Required!</li>
        </ul>
    </ul>
    <li>Returns <code>logger[type].log</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a></li>
</ul>
The <code>dir</code> option allows the developer to specify in which main-branch the logger will document it's log file(s). The <code>type</code> option  allows the developer to specify in which sub-branch the logger will document it's log file(s). It also determines how you can access the log function from the logger Object. The <code>name</code> option allows the developer to specify  how the log file will be named. Change the name by <code>logger[type].setName(newName)</code> and a new log file will be created in the sub branch. This opens the possibility to create a new log file on a clock's tick event, or anything else. The <code>formatter</code> is a function that allows the developer to manipulate the log string into desired format, the function's second parameter <code>callback</code> must be used to pass through the self-formatted string. The <code>extend</code> option allows the developer to extend a logger[type2] with a logger[type1] so that logger[type2] will also log it's data to the log file from logger[type1]. Checkout out the example below to see how multiple modules with callbacks can be chained in a formatter function and to see how logger.error is extended from logger.log. 
<h2>logger[type]</h2>
<pre><code>(async function loadApplication() {
    await new Logger("log");
    // output: ./loggers/log/monkey.log
    await new Logger("error");
    // output: ./loggers/error/monkey.log
    console.log(logger);
    // {
    //     log: [Function: log] { setName: [Function] },
    //     error: [Function: log] { setName: [Function] }
    // }
}());</code></pre>
<h2>Example</h2>
<pre><code>(async function loadApplication() {
    const { Logger, logger } = require("monkey-logger");
    const { localeTimezoneDate, dateNotation, utc0 } = require("locale-timezone-date");
    const IndentModel = require("indent-model");
    const TaskClock = require("task-clock");
    // ...
    const tabs5_4 = new IndentModel({ spaces: 5, spaced: 4 });
    const formatter = (data, callback) => localeTimezoneDate.toISOString(new Date(),
        isoStr => tabs5_4.tabify(isoStr, ...data, logString => {
            callback(logString);
            console.log(logString);
        }));
    // ...
    await new Logger("log", { name: dateNotation.yyyymmdd(new Date()), formatter });
    await new Logger("error", { name: dateNotation.yyyymmdd(new Date()), formatter, extend: [logger.log] });
    // ...
    new TaskClock({ start: new Date(new Date().setHours(0, 0, 0, 0)), interval: { h: 24 } },
        (now) => {
            const yyyymmdd = dateNotation.yyyymmdd(now)
            logger.log.setName(yyyymmdd);
            logger.error.setName(yyyymmdd);
        });
    // ...
    logger.log("GET", "/v1/someapi/mongol/1", "spider", "monkey");
    logger.log("CLOSED", "/v1/someapi/mongol/1", "spider", "monkey");
    logger.error("FAILED", "/v1/someapi/mongol/1", "find errors in " + logger.error.filepath, "monkey!");
    logger.error("FAILED", "/v1/someapi/mongol/2", "find errors in " + logger.error.filepath, "monkey!");
    logger.log.setName("test")
    logger.error("FAILED", "/v1/someapi/mongol/3", "find errors in " + logger.error.filepath, "monkey!");
    logger.log("GET", "/v1/someapi/mongol/2", "spider", "monkey");
    logger.log("CLOSED", "/v1/someapi/mongol/2", "spider", "monkey");
    // ...
    // 2020-08-15T21:26:19.824+0200       GET       /v1/someapi/mongol/1     spider    monkey
    // 2020-08-15T21:26:19.836+0200       CLOSED    /v1/someapi/mongol/1     spider    monkey
    // 2020-08-15T21:26:19.837+0200       FAILED    /v1/someapi/mongol/1     find errors in loggers\error\2020-08-15.log       monkey!
    // 2020-08-15T21:26:19.838+0200       FAILED    /v1/someapi/mongol/2     find errors in loggers\error\2020-08-15.log       monkey!
    // 2020-08-15T21:26:19.839+0200       FAILED    /v1/someapi/mongol/3     find errors in loggers\error\2020-08-15.log       monkey!
    // 2020-08-15T21:26:19.839+0200       GET       /v1/someapi/mongol/2     spider    monkey
    // 2020-08-15T21:26:19.840+0200       CLOSED    /v1/someapi/mongol/2     spider    monkey
    // ...
    // 1st OUTPUT: /loggers/log/2020-08-16.log
    // 2nd OUTPUT: /loggers/log/2020-08-16.log
    // 3rd OUTPUT: /loggers/error/2020-08-16.log + OUTPUT: /loggers/log/2020-08-16.log
    // 4th OUTPUT: /loggers/error/2020-08-16.log + OUTPUT: /loggers/log/2020-08-16.log
    // 5th OUTPUT: /loggers/error/2020-08-16.log + OUTPUT: /loggers/log/test.log
    // 6th OUTPUT: /loggers/log/test.log
    // 7th OUTPUT: /loggers/log/test.log
}());</code></pre>
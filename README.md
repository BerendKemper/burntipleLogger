# monkey-logger
Node JS every day a new log file and error file

<pre><code>npm i monkey-logger // WARNING not published yet

const { Logger, logger } = require("monkey-logger");</code></pre>

<h3>new Logger(type[,options])</h3>
<ul>
    <li><code>type</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a></li>
    <li><code>options</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;Object&gt;</a></li>
    <ul>
        <li><code>dir</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <code>loggers</code></li>
        <li><code>name</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <code>monkey</code></li>
        <li><code>formatter</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a></li>
        <ul>
            <li><code>...data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Primitive_values">&lt;primitives&gt;</a></li>
        </ul>
    </ul>
    <li>Returns <code>logger[type]</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a></li>
</ul>

<h3>logger[type]</h3>
<pre><code>(async function loadApplication() {
    await new Logger("log");
    // output: ./loggers/log/monkey.log
    await new Logger("error");
    // output: ./loggers/error/monkey.log
    console.log(logger);
    // {
    //     log: [Function] { setName: [Function] },
    //     error: [Function] { setName: [Function] }
    // }
}());</code></pre>

<h3>Class Logger</h3>

<h3>Logger.delete(type)</h3>
<ul>
    <li><code>type</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <code>log</code></li>
</ul>
<pre><code>new Logger("test", { name: "tester" }).then(() => {
    // output: ./loggers/test/tester.log
    console.log(logger); 
    // {
    //     test: (...data) => [Function] { setName: [Function] }
    // }
    Logger.delete("test");
    console.log(logger); 
    // { }
});</code></pre>

<h3>Examples</h3>
<pre><code>(async function loadApplication() {
    const { Logger, logger } = require("monkey-logger");
    const { localeTimezoneDate, dateNotation, utc0 } = require("locale-timezone-date");
    const IndentModel = require("indent-model");
    const TaskClock = require("task-clock");
    // ...
    const tabs5_4 = new IndentModel({ spaces: 5, spaced: 4 });
    await new Logger("log", { name: dateNotation.yyyymmdd(new Date()), formatter: 
        (...data) => tabs5_4.tabify(localeTimezoneDate.toISOString(new Date()), ...data) });
    await new Logger("error", { name: dateNotation.yyyymmdd(new Date()), formatter: 
        (...data) => tabs5_4.tabify(localeTimezoneDate.toISOString(new Date()), ...data) });
    new TaskClock({ 
        start: new Date(new Date().setHours(0, 0, 0, 0)), 
        interval: { h: 24 }
    }, (tick, now) => {
        const yyyymmdd = dateNotation.yyyymmdd(now)
        logger.log.setName(yyyymmdd);
        logger.error.setName(yyyymmdd);
    });
    // ...
    logger.log("GET", "/v1/someapi/mongol", "spider", "monkey");
    logger.log("CLOSED", "/v1/someapi/mongol", "spider", "monkey");
    // 2020-08-12T23:59:56.496+0200       GET       /v1/someapi/mongol       spider    monkey
    // 2020-08-12T23:59:56.497+0200       CLOSED    /v1/someapi/mongol       spider    monkey
}());
</code></pre>
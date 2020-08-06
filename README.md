# logger
Node JS every day a new log file and error file

<pre>
<code>// Example
const logger = require("logger");

const http = require("http");
const server = http.createServer();

const io = require('socket.io')(server);

const EventEmitter = require("events");
const socketHelper = new EventEmitter();

/*
Syntax: logger.log(...data[, callback]) 
        logger.error(...data[, callback])
callback is optional, takes in one parameter:   logString => { /* whatever you do with it*/ }
//*/

logger.log("testing logger", 1, 2, true, false, logString => socketHelper.emit("returnLogger", logString));
// logs "2020-08-06T15:00:09.884+0200    testing logger      1    2     true      false"    

io.on("connect", socket => {
    // ...
    // You could use the callback to show the logString in the front-end
    
    const emitReturnLogger = logString => socket.emit("returnLogger", logString);
    socketHelper.on("returnLogger", logString => emitReturnLogger(logString));
    socket.on("disconnect", reason => {
        socketHelper.removeListener("returnLogger", emitReturnLogger);
    });
});</code>
</pre>

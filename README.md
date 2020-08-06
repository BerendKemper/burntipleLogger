# logger
node js every day a new log file and error file

<pre>
<code>// Examples
const logger = require("logger");

const http = require("http");
const server = http.createServer();

const io = require('socket.io')(server);

const EventEmitter = require("events");
const socketHelper = new EventEmitter();

// Syntax: logger.log(...data[, callback]) 
//         logger.error(...data[, callback])
// callback is optional

logger.log("testing logger", 1, 2, true, false, logString => socketHelper.emit("returnLogger", logString));
// loggs "testing logger      1    2     true      false"    

io.on("connect", socket => {
    //...
    
    const emitReturnLogger = logString => socket.emit("returnLogger", logString);
    socketHelper.on("returnLogger", logString => emitReturnLogger(logString));
    
    socket.on("disconnect", reason => {
        socketHelper.removeListener("returnLogger", emitReturnLogger);
    });
});</code>
</pre>

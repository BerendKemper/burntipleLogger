# logger
node js every day a new log file, error file

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

<div style="font-size: 8px;">
    <pre>2020-08-06T14:51:22.238+0200    GET       url: /v1/tickets/7091765/guidion        </pre><pre>2020-08-06T14:51:21.903+0200    CLOSED    url: /v1/tickets/7118886/guidion        </pre><pre>2020-08-06T14:51:21.902+0200    GET       url: /v1/tickets/7118886/guidion        </pre><pre>2020-08-06T14:51:18.371+0200    CLOSED    url: /v1/tickets/7118880/guidion        </pre><pre>2020-08-06T14:51:18.369+0200    GET       url: /v1/tickets/7118880/guidion        </pre><pre>2020-08-06T14:51:17.907+0200    CLOSED    url: /v1/tickets/7104285/guidion        </pre><pre>2020-08-06T14:51:17.906+0200    GET       url: /v1/tickets/7104285/guidion        </pre><pre>2020-08-06T14:51:13.434+0200    CLOSED    url: /v1/tickets/7118876/guidion        </pre><pre>2020-08-06T14:51:13.433+0200    GET       url: /v1/tickets/7118876/guidion        </pre><pre>2020-08-06T14:51:05.669+0200    CLOSED    url: /v1/tickets/7121569/guidion        </pre><pre>2020-08-06T14:51:05.667+0200    GET       url: /v1/tickets/7121569/guidion        </pre><pre>2020-08-06T14:51:05.326+0200    CLOSED    url: /v1/tickets/7100579/guidion        </pre><pre>2020-08-06T14:51:05.325+0200    GET       url: /v1/tickets/7100579/guidion        </pre><pre>2020-08-06T14:51:05.119+0200    CLOSED    url: /v1/tickets/7099159/guidion        </pre><pre>2020-08-06T14:51:05.117+0200    GET       url: /v1/tickets/7099159/guidion        </pre><pre>2020-08-06T14:51:01.510+0200    CLOSED    url: /v1/tickets/7081837/guidion        </pre><pre>2020-08-06T14:51:01.508+0200    GET       url: /v1/tickets/7081837/guidion        </pre><pre>2020-08-06T14:51:01.168+0200    CLOSED    url: /v1/tickets/7121044/guidion        </pre><pre>2020-08-06T14:51:01.167+0200    GET       url: /v1/tickets/7121044/guidion        </pre><pre>2020-08-06T14:51:00.964+0200    CLOSED    url: /v1/tickets/7086790/guidion        </pre><pre>2020-08-06T14:51:00.962+0200    GET       url: /v1/tickets/7086790/guidion        </pre><pre>2020-08-06T14:51:00.565+0200    CLOSED    url: /v1/tickets/7156921/guidion        </pre><pre>2020-08-06T14:51:00.563+0200    GET       url: /v1/tickets/7156921/guidion        </pre><pre>2020-08-06T14:51:00.287+0200    CLOSED    url: /v1/tickets/7010976/guidion        </pre><pre>2020-08-06T14:51:00.286+0200    GET       url: /v1/tickets/7010976/guidion        </pre><pre>2020-08-06T14:50:55.703+0200    CLOSED    url: /v1/tickets/7073973/guidion        </pre><pre>2020-08-06T14:50:55.702+0200    GET       url: /v1/tickets/7073973/guidion        </pre><pre>2020-08-06T14:50:55.497+0200    CLOSED    url: /v1/tickets/7118874/guidion        </pre><pre>2020-08-06T14:50:55.495+0200    GET       url: /v1/tickets/7118874/guidion        </pre><pre>2020-08-06T14:50:55.048+0200    CLOSED    url: /v1/tickets/7109409/guidion        </pre><pre>2020-08-06T14:50:55.045+0200    GET       url: /v1/tickets/7109409/guidion        </pre><pre>2020-08-06T14:50:54.701+0200    CLOSED    url: /v1/tickets/7104392/guidion        </pre><pre>2020-08-06T14:50:54.699+0200    GET       url: /v1/tickets/7104392/guidion        </pre><pre>2020-08-06T14:50:50.840+0200    CLOSED    url: /v1/tickets/7109421/guidion        </pre><pre>2020-08-06T14:50:50.839+0200    GET       url: /v1/tickets/7109421/guidion        </pre><pre>2020-08-06T14:50:50.301+0200    CLOSED    url: /v1/tickets/7106967/guidion        </pre>
</div>

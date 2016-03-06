var ws = require("nodejs-websocket")

var path = require("path");
var proc = require("child_process");

var tsserver = proc.spawn(path.join(__dirname, "..", "node_modules", "typescript", "bin", "tsserver"));

var server = ws.createServer(function (conn) {
  console.log("New connection")
  tsserver.stdout.on('data', function (data) {
    console.log("Sending " + data)
    try {
      conn.sendText(data);
    } catch (e) {
      console.error("connection closed");
    }
  });
  conn.on("text", function (str) {
    console.log("Received " + str)
    tsserver.stdin.write(str);
  })
  conn.on("close", function (code, reason) {
    console.log("Connection closed")
  })
}).listen(8001)

console.log("listenting for ws connetings on port 8001");